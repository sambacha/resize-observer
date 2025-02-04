// Tests if target is an SVGGraphicsElement
const isSVG = (target: Element | SVGGraphicsElement): target is SVGGraphicsElement =>
  target instanceof SVGElement && 'getBBox' in target;

// Checks to see if element is hidden (has no display)
const isHidden = (target: Element): boolean => {
  if (isSVG(target)) {
    const { width, height } = (target as SVGGraphicsElement).getBBox();
    return !width && !height;
  }
  const { offsetWidth, offsetHeight } = target as HTMLElement;
  return !(offsetWidth || offsetHeight || target.getClientRects().length);
}

// Checks if an object is an Element
const isElement = (obj: unknown): obj is Element => {
  if (obj instanceof Element) {
    return true;
  }
  const scope = (obj as Element)?.ownerDocument?.defaultView;
  return !!(scope && obj instanceof (scope as unknown as typeof globalThis).Element);
};

const isReplacedElement = (target: Element): boolean => {
  switch (target.tagName) {
    case 'INPUT':
      if ((target as HTMLInputElement).type !== 'image') {
        break;
      }
    case 'VIDEO':
    case 'AUDIO':
    case 'EMBED':
    case 'OBJECT':
    case 'CANVAS':
    case 'IFRAME':
    case 'IMG':
      return true;
  }
  return false;
}

const isDocument = (node: Node | Document | DocumentFragment): node is Document | DocumentFragment => {
  const t =  node && node.nodeType;
  return t === 9 || t === 11;
}

export {
  isSVG,
  isHidden,
  isElement,
  isDocument,
  isReplacedElement
};
