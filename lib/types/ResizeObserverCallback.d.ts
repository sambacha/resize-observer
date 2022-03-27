import { ResizeObserver } from './ResizeObserver';
import { ResizeObserverEntry } from './ResizeObserverEntry';
/**
 * https://drafts.csswg.org/resize-observer-1/#resize-observer-callback
 */
declare type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;
export { ResizeObserverCallback };
