import { ResizeObserver } from './ResizeObserver';
import { ResizeObservation } from './ResizeObservation';
import { ResizeObserverCallback } from './ResizeObserverCallback';
/**
 * Holds additional information about a resize observer,
 * to be used internally.
 */
declare class ResizeObserverDetail {
    callback: ResizeObserverCallback;
    observer: ResizeObserver;
    activeTargets: ResizeObservation[];
    skippedTargets: ResizeObservation[];
    observationTargets: ResizeObservation[];
    constructor(resizeObserver: ResizeObserver, callback: ResizeObserverCallback);
}
export { ResizeObserverDetail };
