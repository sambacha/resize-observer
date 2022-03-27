(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.window = global.window || {}));
})(this, (function (exports) { 'use strict';

    var ResizeObserverBoxOptions;
    (function (ResizeObserverBoxOptions) {
        ResizeObserverBoxOptions["BORDER_BOX"] = "border-box";
        ResizeObserverBoxOptions["CONTENT_BOX"] = "content-box";
        ResizeObserverBoxOptions["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
    })(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));

    const freeze = (obj) => Object.freeze(obj);

    class ResizeObserverSize {
        constructor(inlineSize, blockSize) {
            this.inlineSize = inlineSize;
            this.blockSize = blockSize;
            freeze(this);
        }
    }

    class DOMRectReadOnly {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.top = this.y;
            this.left = this.x;
            this.bottom = this.top + this.height;
            this.right = this.left + this.width;
            return freeze(this);
        }
        toJSON() {
            const { x, y, top, right, bottom, left, width, height } = this;
            return { x, y, top, right, bottom, left, width, height };
        }
        static fromRect(rectangle) {
            return new DOMRectReadOnly(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        }
    }

    const isSVG = (target) => target instanceof SVGElement && 'getBBox' in target;
    const isHidden = (target) => {
        if (isSVG(target)) {
            const { width, height } = target.getBBox();
            return !width && !height;
        }
        const { offsetWidth, offsetHeight } = target;
        return !(offsetWidth || offsetHeight || target.getClientRects().length);
    };
    const isElement = (obj) => {
        if (obj instanceof Element) {
            return true;
        }
        const scope = obj?.ownerDocument?.defaultView;
        return !!(scope && obj instanceof scope.Element);
    };
    const isReplacedElement = (target) => {
        switch (target.tagName) {
            case 'INPUT':
                if (target.type !== 'image') {
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
    };
    const isDocument = (node) => {
        const t = node && node.nodeType;
        return t === 9 || t === 11;
    };

    const global = typeof window !== 'undefined' ? window : {};

    const cache = new WeakMap();
    const scrollRegexp = /auto|scroll/;
    const verticalRegexp = /^tb|vertical/;
    const IE = (/msie|trident/i).test(global.navigator && global.navigator.userAgent);
    const parseDimension = (pixel) => parseFloat(pixel || '0');
    const size = (inlineSize = 0, blockSize = 0, switchSizes = false) => {
        return new ResizeObserverSize((switchSizes ? blockSize : inlineSize) || 0, (switchSizes ? inlineSize : blockSize) || 0);
    };
    const zeroBoxes = freeze({
        devicePixelContentBoxSize: size(),
        borderBoxSize: size(),
        contentBoxSize: size(),
        contentRect: new DOMRectReadOnly(0, 0, 0, 0)
    });
    const calculateBoxSizes = (target, forceRecalculation = false) => {
        if (cache.has(target) && !forceRecalculation) {
            return cache.get(target);
        }
        if (isHidden(target)) {
            cache.set(target, zeroBoxes);
            return zeroBoxes;
        }
        const cs = getComputedStyle(target);
        const svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
        const removePadding = !IE && cs.boxSizing === 'border-box';
        const switchSizes = verticalRegexp.test(cs.writingMode || '');
        const canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || '');
        const canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || '');
        const paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
        const paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
        const paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
        const paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
        const borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
        const borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
        const borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
        const borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
        const horizontalPadding = paddingLeft + paddingRight;
        const verticalPadding = paddingTop + paddingBottom;
        const horizontalBorderArea = borderLeft + borderRight;
        const verticalBorderArea = borderTop + borderBottom;
        const horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
        const verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
        const widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
        const heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
        const contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
        const contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
        const borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
        const borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
        const boxes = freeze({
            devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
            borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
            contentBoxSize: size(contentWidth, contentHeight, switchSizes),
            contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
        });
        cache.set(target, boxes);
        return boxes;
    };
    const calculateBoxSize = (target, observedBox, forceRecalculation) => {
        const { borderBoxSize, contentBoxSize, devicePixelContentBoxSize } = calculateBoxSizes(target, forceRecalculation);
        switch (observedBox) {
            case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
                return devicePixelContentBoxSize;
            case ResizeObserverBoxOptions.BORDER_BOX:
                return borderBoxSize;
            default:
                return contentBoxSize;
        }
    };

    const skipNotifyOnElement = (target) => {
        return !isSVG(target)
            && !isReplacedElement(target)
            && getComputedStyle(target).display === 'inline';
    };
    class ResizeObservation {
        constructor(target, observedBox) {
            this.target = target;
            this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
            this.lastReportedSize = {
                inlineSize: 0,
                blockSize: 0
            };
        }
        isActive() {
            const size = calculateBoxSize(this.target, this.observedBox, true);
            if (skipNotifyOnElement(this.target)) {
                this.lastReportedSize = size;
            }
            if (this.lastReportedSize.inlineSize !== size.inlineSize
                || this.lastReportedSize.blockSize !== size.blockSize) {
                return true;
            }
            return false;
        }
    }

    class ResizeObserverDetail {
        constructor(resizeObserver, callback) {
            this.activeTargets = [];
            this.skippedTargets = [];
            this.observationTargets = [];
            this.observer = resizeObserver;
            this.callback = callback;
        }
    }

    const resizeObservers = [];

    const hasActiveObservations = () => {
        return resizeObservers.some((ro) => ro.activeTargets.length > 0);
    };

    const hasSkippedObservations = () => {
        return resizeObservers.some((ro) => ro.skippedTargets.length > 0);
    };

    const msg = 'ResizeObserver loop completed with undelivered notifications.';
    const deliverResizeLoopError = () => {
        let event;
        if (typeof ErrorEvent === 'function') {
            event = new ErrorEvent('error', {
                message: msg
            });
        }
        else {
            event = document.createEvent('Event');
            event.initEvent('error', false, false);
            event.message = msg;
        }
        window.dispatchEvent(event);
    };

    class ResizeObserverEntry {
        constructor(target) {
            const boxes = calculateBoxSizes(target);
            this.target = target;
            this.contentRect = boxes.contentRect;
            this.borderBoxSize = freeze([boxes.borderBoxSize]);
            this.contentBoxSize = freeze([boxes.contentBoxSize]);
            this.devicePixelContentBoxSize = freeze([boxes.devicePixelContentBoxSize]);
        }
    }

    const calculateDepthForNode = (node) => {
        if (isHidden(node)) {
            return Infinity;
        }
        let depth = 0;
        let parent = node.parentNode;
        while (parent) {
            depth += 1;
            parent = parent.parentNode;
        }
        return depth;
    };

    const broadcastActiveObservations = () => {
        let shallowestDepth = Infinity;
        const callbacks = [];
        resizeObservers.forEach(function processObserver(ro) {
            if (ro.activeTargets.length === 0) {
                return;
            }
            const entries = [];
            ro.activeTargets.forEach(function processTarget(ot) {
                const entry = new ResizeObserverEntry(ot.target);
                const targetDepth = calculateDepthForNode(ot.target);
                entries.push(entry);
                ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
                if (targetDepth < shallowestDepth) {
                    shallowestDepth = targetDepth;
                }
            });
            callbacks.push(function resizeObserverCallback() {
                ro.callback.call(ro.observer, entries, ro.observer);
            });
            ro.activeTargets.splice(0, ro.activeTargets.length);
        });
        for (const callback of callbacks) {
            callback();
        }
        return shallowestDepth;
    };

    const gatherActiveObservationsAtDepth = (depth) => {
        resizeObservers.forEach(function processObserver(ro) {
            ro.activeTargets.splice(0, ro.activeTargets.length);
            ro.skippedTargets.splice(0, ro.skippedTargets.length);
            ro.observationTargets.forEach(function processTarget(ot) {
                if (ot.isActive()) {
                    if (calculateDepthForNode(ot.target) > depth) {
                        ro.activeTargets.push(ot);
                    }
                    else {
                        ro.skippedTargets.push(ot);
                    }
                }
            });
        });
    };

    const process = () => {
        let depth = 0;
        gatherActiveObservationsAtDepth(depth);
        while (hasActiveObservations()) {
            depth = broadcastActiveObservations();
            gatherActiveObservationsAtDepth(depth);
        }
        if (hasSkippedObservations()) {
            deliverResizeLoopError();
        }
        return depth > 0;
    };

    let trigger;
    const callbacks = [];
    const notify = () => callbacks.splice(0).forEach((cb) => cb());
    const queueMicroTask = (callback) => {
        if (!trigger) {
            let toggle = 0;
            const el = document.createTextNode('');
            const config = { characterData: true };
            new MutationObserver(() => notify()).observe(el, config);
            trigger = () => { el.textContent = `${toggle ? toggle-- : toggle++}`; };
        }
        callbacks.push(callback);
        trigger();
    };

    const queueResizeObserver = (cb) => {
        queueMicroTask(function ResizeObserver() {
            requestAnimationFrame(cb);
        });
    };

    const CATCH_PERIOD = 250;
    const time = (timeout = 0) => Date.now() + timeout;
    let scheduled = false;
    class Scheduler {
        constructor() {
            this.stopped = true;
            this.listener = () => this.schedule();
        }
        run(timeout = CATCH_PERIOD) {
            if (scheduled) {
                return;
            }
            scheduled = true;
            const until = time(timeout);
            queueResizeObserver(() => {
                let elementsHaveResized = false;
                try {
                    elementsHaveResized = process();
                }
                finally {
                    scheduled = false;
                    timeout = until - time();
                    if (elementsHaveResized) {
                        this.run(1000);
                    }
                    else if (timeout > 0) {
                        this.run(timeout);
                    }
                }
            });
        }
        schedule() {
            this.run();
        }
        get scheduled() {
            return scheduled;
        }
    }
    const scheduler = new Scheduler();

    const windowEvents = [
        'resize',
        'load',
    ];
    const documentEvents = [
        'transitionend',
        'animationend',
        'animationstart',
        'animationiteration',
        'keyup',
        'keydown',
        'mouseup',
        'mousedown',
        'mouseover',
        'mouseout',
        'touchstart',
        'touchend',
        'touchmove',
        'touchcancel',
        'blur',
        'focus'
    ];

    let observedElements = 0;
    const documents = new WeakMap();
    const windows = new WeakMap();
    const observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
    const handleEvent = () => observedElements && scheduler.schedule();
    const mo = new MutationObserver(handleEvent);
    const getDocument = (node) => {
        const root = node.getRootNode ? node.getRootNode({ composed: node.nodeType === 11 }) : node.ownerDocument;
        if (root && root !== node) {
            return isDocument(root) ? root : getDocument(root);
        }
        return null;
    };
    const addWindow = (window) => {
        if (!windows.has(window)) {
            windows.set(window, 1);
            for (const event of windowEvents) {
                window.addEventListener(event, handleEvent, true);
            }
        }
    };
    const addDocument = (document) => {
        if (!documents.has(document)) {
            documents.set(document, 1);
            for (const event of documentEvents) {
                document.addEventListener(event, handleEvent, true);
            }
            mo.observe(document, observerConfig);
        }
    };
    const observeElementTree = (element) => {
        let document = getDocument(element);
        let window = element.ownerDocument?.defaultView;
        while (window) {
            addWindow(window);
            addDocument(window.document);
            try {
                window = window === window.parent ? null : window.parent;
            }
            catch {
                window = null;
            }
        }
        while (document) {
            addDocument(document);
            document = getDocument(document);
        }
    };
    const registerAddition = (element) => {
        observeElementTree(element);
        observedElements++;
        handleEvent();
    };
    const registerRemoval = (element) => {
        observedElements--;
    };

    const observerMap = new WeakMap();
    const getObservationIndex = (observationTargets, target) => {
        for (let i = 0; i < observationTargets.length; i += 1) {
            if (observationTargets[i].target === target) {
                return i;
            }
        }
        return -1;
    };
    class ResizeObserverController {
        static connect(resizeObserver, callback) {
            const detail = new ResizeObserverDetail(resizeObserver, callback);
            observerMap.set(resizeObserver, detail);
        }
        static observe(resizeObserver, target, options) {
            const detail = observerMap.get(resizeObserver);
            const firstObservation = detail.observationTargets.length === 0;
            if (getObservationIndex(detail.observationTargets, target) < 0) {
                firstObservation && resizeObservers.push(detail);
                detail.observationTargets.push(new ResizeObservation(target, options && options.box));
                registerAddition(target);
            }
        }
        static unobserve(resizeObserver, target) {
            const detail = observerMap.get(resizeObserver);
            const index = getObservationIndex(detail.observationTargets, target);
            const lastObservation = detail.observationTargets.length === 1;
            if (index >= 0) {
                lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
                detail.observationTargets.splice(index, 1);
                registerRemoval();
            }
        }
        static disconnect(resizeObserver) {
            const detail = observerMap.get(resizeObserver);
            detail.observationTargets.slice().forEach((ot) => this.unobserve(resizeObserver, ot.target));
            detail.activeTargets.splice(0, detail.activeTargets.length);
        }
    }

    class ResizeObserver {
        constructor(callback) {
            if (arguments.length === 0) {
                throw new TypeError(`Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.`);
            }
            if (typeof callback !== 'function') {
                throw new TypeError(`Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.`);
            }
            ResizeObserverController.connect(this, callback);
        }
        observe(target, options) {
            if (arguments.length === 0) {
                throw new TypeError(`Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.`);
            }
            if (!isElement(target)) {
                throw new TypeError(`Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element`);
            }
            ResizeObserverController.observe(this, target, options);
        }
        unobserve(target) {
            if (arguments.length === 0) {
                throw new TypeError(`Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.`);
            }
            if (!isElement(target)) {
                throw new TypeError(`Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element`);
            }
            ResizeObserverController.unobserve(this, target);
        }
        disconnect() {
            ResizeObserverController.disconnect(this);
        }
        static toString() {
            return 'function ResizeObserver () { [polyfill code] }';
        }
    }

    exports.ResizeObserver = ResizeObserver;
    exports.ResizeObserverEntry = ResizeObserverEntry;
    exports.ResizeObserverSize = ResizeObserverSize;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
