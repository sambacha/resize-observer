import { ResizeObserverBoxOptions } from '../ResizeObserverBoxOptions';
import { ResizeObserverSize } from '../ResizeObserverSize';
import { DOMRectReadOnly } from '../DOMRectReadOnly';
interface ResizeObserverSizeCollection {
    devicePixelContentBoxSize: ResizeObserverSize;
    borderBoxSize: ResizeObserverSize;
    contentBoxSize: ResizeObserverSize;
    contentRect: DOMRectReadOnly;
}
/**
 * Gets all box sizes of an element.
 */
declare const calculateBoxSizes: (target: Element, forceRecalculation?: boolean) => ResizeObserverSizeCollection;
/**
 * Calculates the observe box size of an element.
 *
 * https://drafts.csswg.org/resize-observer-1/#calculate-box-size
 */
declare const calculateBoxSize: (target: Element, observedBox: ResizeObserverBoxOptions, forceRecalculation?: boolean | undefined) => ResizeObserverSize;
export { calculateBoxSize, calculateBoxSizes };
