import { ResizeObserverSize } from './ResizeObserverSize';
import { ResizeObserverBoxOptions } from './ResizeObserverBoxOptions';
/**
 * https://drafts.csswg.org/resize-observer-1/#resize-observation-interface
 */
declare class ResizeObservation {
    target: Element;
    observedBox: ResizeObserverBoxOptions;
    lastReportedSize: ResizeObserverSize;
    constructor(target: Element, observedBox?: ResizeObserverBoxOptions);
    isActive(): boolean;
}
export { ResizeObservation };
