import * as THREE from 'three';
import type { PhotoAsset } from '../content/types.ts';
import { publicAssetUrl } from '../public-url.ts';

/**
 * Depth-displaced photograph. This is the reusable core of every 3D photo scene.
 *
 * A photograph is mapped onto a subdivided plane. The plane's vertices are moved along
 * their normal by the depth map (white = near = toward the viewer, black = far), in the
 * vertex shader. The displaced geometry is what the camera sees, so moving the camera or
 * the object shows real parallax. Relief shading uses the slope of the same depth map, so
 * the surface reads as 3D even when the view is still.
 *
 * Nothing here is specific to one photograph. A new photo needs only a manifest entry with
 * its image, depth map and size. See scripts/depth/process-photos.py.
 */

const VERTEX_SHADER = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform vec2 uTexel;     // 1 / depth-map size, in UV units
  uniform vec2 uPlane;     // plane width and height, in scene units
  varying vec2 vUv;
  varying float vShade;

  float depthAt(vec2 uv) {
    return texture2D(uDepth, clamp(uv, vec2(0.0), vec2(1.0))).r;
  }

  void main() {
    vUv = uv;
    float d = depthAt(uv);
    // Relief normal from the depth slope. Depth is in [0, 1] and spans uDepthScale in Z.
    float sx = (depthAt(uv + vec2(uTexel.x, 0.0)) - depthAt(uv - vec2(uTexel.x, 0.0))) * uDepthScale / (2.0 * uTexel.x * uPlane.x);
    float sy = (depthAt(uv + vec2(0.0, uTexel.y)) - depthAt(uv - vec2(0.0, uTexel.y))) * uDepthScale / (2.0 * uTexel.y * uPlane.y);
    vec3 n = normalize(vec3(-sx, -sy, 1.0));
    vec3 light = normalize(vec3(-0.35, 0.55, 0.75));
    vShade = clamp(dot(n, light), 0.0, 1.0);

    vec3 displaced = position + vec3(0.0, 0.0, (d - 0.5) * uDepthScale);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying float vShade;

  void main() {
    vec4 colour = texture2D(uMap, vUv);
    colour.rgb *= mix(0.8, 1.06, vShade);
    gl_FragColor = colour;
    #include <colorspace_fragment>
  }
`;

export interface DepthPhoto {
  /** Plane with depth-displaced geometry. Its local origin is the centre of the photo. */
  mesh: THREE.Mesh;
  /** Plane size in scene units. */
  width: number;
  height: number;
  /** Depth displacement in scene units. */
  depthScale: number;
  dispose(): void;
}

/**
 * Loads the photograph and its depth map, then builds the displaced plane. Resolves only
 * when both textures are ready, so a scene never shows a blank plane. Rejects if either file
 * fails, and the stage then keeps the static photograph.
 */
export async function createDepthPhoto(photo: PhotoAsset, options: { height?: number; segments?: number } = {}): Promise<DepthPhoto> {
  const height = options.height ?? 2;
  const width = height * (photo.width / photo.height);
  const depthScale = (photo.depthScale ?? 0.3) * height;
  const segments = options.segments ?? 160;

  const [colour, depth] = await Promise.all([
    loadTexture(publicAssetUrl(photo.src), THREE.SRGBColorSpace),
    loadTexture(publicAssetUrl(photo.depth), THREE.NoColorSpace),
  ]);

  const geometry = new THREE.PlaneGeometry(width, height, segments, Math.max(2, Math.round(segments * (height / width))));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: colour },
      uDepth: { value: depth },
      uDepthScale: { value: depthScale },
      uTexel: { value: new THREE.Vector2(1 / photo.width, 1 / photo.height) },
      uPlane: { value: new THREE.Vector2(width, height) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });
  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    width,
    height,
    depthScale,
    dispose() {
      geometry.dispose();
      material.dispose();
      colour.dispose();
      depth.dispose();
    },
  };
}

function loadTexture(url: string, colorSpace: THREE.ColorSpace): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        texture.anisotropy = 4;
        resolve(texture);
      },
      undefined,
      () => reject(new Error(`Photo texture failed to load: ${url}`)),
    );
  });
}
