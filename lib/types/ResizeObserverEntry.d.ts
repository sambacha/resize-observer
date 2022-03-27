import { DOMRectReadOnly } from './DOMRectReadOnly';
import { ResizeObserverSize } from './ResizeObserverSize';
/**
 * https://drafts.csswg.org/resize-observer-1/#resize-observer-entry-interface
 */
declare class ResizeObserverEntry {
    target: Element;
    contentRect: DOMRectReadOnly;
    borderBoxSize: readonly ResizeObserverSize[];
    contentBoxSize: readonly ResizeObserverSize[];
    devicePixelContentBoxSize: readonly ResizeObserverSize[];
    constructor(target: Element);
}
export { ResizeObserverEntry };
