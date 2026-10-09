import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** The one GSAP instance for the site, with ScrollTrigger registered once. */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
