/**
 * Size of a specific box.
 *
 * https://drafts.csswg.org/resize-observer-1/#resizeobserversize
 */
declare class ResizeObserverSize {
    readonly inlineSize: number;
    readonly blockSize: number;
    constructor(inlineSize: number, blockSize: number);
}
export { ResizeObserverSize };
