import { ResizeObserverCallback } from './ResizeObserverCallback';
import { ResizeObserverOptions } from './ResizeObserverOptions';
/**
 * The ResizeObserver API is an interface for observing changes to Element’s size.
 * It is an Element's counterpart to window.resize event.
 *
 * https://drafts.csswg.org/resize-observer-1/#resize-observer-interface
 */
declare class ResizeObserver {
    constructor(callback: ResizeObserverCallback);
    /**
     * Observes an element,
     * notifying the handler of the current and subsequent sizes.
     * @param target Element to observe
     * @param options Options to pass to the observer
     * @returns {void}
     */
    observe(target: Element, options?: ResizeObserverOptions): void;
    /**
     * Stops observing the element for any further changes.
     * @param target Element to stop observing
     * @returns {void}
     */
    unobserve(target: Element): void;
    /**
     * Disconnects all observed targets.
     * @returns {void}
     */
    disconnect(): void;
    /**
     * @override
     */
    static toString(): string;
}
export { ResizeObserver };
