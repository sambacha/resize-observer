/**
 * Registers the addition of a newly observed element.
 * @param element Element to register
 * @returns {void}
 */
declare const registerAddition: (element: Element) => void;
/**
 * Registers the removal of a newly unobserved element.
 * @param element Element to register
 * @returns {void}
 */
declare const registerRemoval: (element: Element) => void;
export { registerAddition, registerRemoval };
