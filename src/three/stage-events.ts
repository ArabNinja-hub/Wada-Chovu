/**
 * Event names shared by the stage and the page. Kept in a module with no dependencies, so the
 * page can listen for them without loading the 3D code.
 */

/** Sent from a slot when its 3D scene cannot run, so the page can drop any height it reserved for 3D. */
export const STAGE_UNAVAILABLE = 'stage:unavailable';
