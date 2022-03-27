declare const isSVG: (target: Element | SVGGraphicsElement) => target is SVGGraphicsElement;
declare const isHidden: (target: Element) => boolean;
declare const isElement: (obj: unknown) => obj is Element;
declare const isReplacedElement: (target: Element) => boolean;
declare const isDocument: (node: Node | Document | DocumentFragment) => node is Document | DocumentFragment;
export { isSVG, isHidden, isElement, isDocument, isReplacedElement };
