<p align="center">
  <img width="200" src="https://user-images.githubusercontent.com/1519516/68546547-4a6d1d80-03cf-11ea-8b9b-9acb34da4ba4.png" />
</p>

<h1 align="center">Resize Observer</h1>

![](https://img.shields.io/circleci/project/github/juggle/resize-observer/master.svg?logo=circleci&style=for-the-badge)
![](https://img.shields.io/coveralls/github/juggle/resize-observer.svg?logoColor=white&style=for-the-badge)
![](https://img.shields.io/bundlephobia/minzip/@juggle/resize-observer.svg?colorB=%233399ff&style=for-the-badge)
![](https://img.shields.io/npm/l/@juggle/resize-observer.svg?colorB=%233399ff&style=for-the-badge)

A minimal library which polyfills the **ResizeObserver** API and is entirely based on the latest [Draft Specification](https://drafts.csswg.org/resize-observer-1/).

It immediately detects when an element resizes and provides accurate sizing information back to the handler. Check out the [Example Playground](//juggle.studio/resize-observer) for more information on usage and performance.

> The latest [Resize Observer specification](https://drafts.csswg.org/resize-observer-1/) is not yet finalised and is subject to change.
> Any drastic changes to the specification will bump the major version of this library, as there will likely be breaking changes.


## Installation
``` shell
npm i @juggle/resize-observer
```

## Basic usage
``` js
import ResizeObserver from '@juggle/resize-observer';

const ro = new ResizeObserver((entries, observer) => {
  console.log('Body has resized!');
  observer.disconnect(); // Stop observing
});

ro.observe(document.body); // Watch dimension changes on body
```
This will use the [ponyfilled](https://github.com/sindresorhus/ponyfill) version of **ResizeObserver**, even if the browser supports **ResizeObserver** natively.

## Watching multiple elements
``` js
import ResizeObserver from '@juggle/resize-observer';

const ro = new ResizeObserver((entries, observer) => {
  console.log('Elements resized:', entries.length);
  entries.forEach((entry, index) => {
    const { inlineSize, blockSize } = entry.contentBoxSize;
    console.log(`Element ${index + 1}:`, `${inlineSize}x${blockSize}`);
  });
});

const els = document.querySelectorAll('.resizes');
[...els].forEach(el => ro.observe(el)); // Watch multiple!
```

## Watching different box sizes

The latest standards allow for watching different box sizes. The box size option can be specified when observing an element. Options include `border-box` and `content-box` (default).
``` js
import ResizeObserver from '@juggle/resize-observer';

const ro = new ResizeObserver((entries, observer) => {
  console.log('Elements resized:', entries.length);
  entries.forEach((entry, index) => {
    const { inlineSize, blockSize } = entry.borderBoxSize;
    console.log(`Element ${index + 1}:`, `${inlineSize}x${blockSize}`);
  });
});

// Watch border-box
const observerOptions = {
  box: 'border-box'
};

const els = document.querySelectorAll('.resizes');
[...els].forEach(el => ro.observe(el, observerOptions));
```

## Using the legacy version (`contentRect`)

Early versions of the API return a `contentRect`. This is still made available for backwards compatibility.

``` js
import ResizeObserver from '@juggle/resize-observer';

const ro = new ResizeObserver((entries, observer) => {
  console.log('Elements resized:', entries.length);
  entries.forEach((entry, index) => {
    const { width, height } = entry.contentRect;
    console.log(`Element ${index + 1}:`, `${width}x${height}`);
  });
});

const els = document.querySelectorAll('.resizes');
[...els].forEach(el => ro.observe(el));
```


## Switching between native and polyfilled versions

You can check to see if the native version is available and switch between this and the polyfill to improve performance on browsers with native support.

``` js
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || Polyfill;

// Uses native or polyfill, depending on browser support.
const ro = new ResizeObserver((entries, observer) => {
  console.log('Something has resized!');
});
```

To improve this even more, you could use dynamic imports to only load the file when the polyfill is required.

``` js
(async () => {
  if ('ResizeObserver' in window === false) {
    // Loads polyfill asynchronously, only if required.
    const module = await import('@juggle/resize-observer');
    window.ResizeObserver = module.ResizeObserver;
  }
  // Uses native or polyfill, depending on browser support.
  const ro = new ResizeObserver((entries, observer) => {
    console.log('Something has resized!');
  });
})();
```

> Browsers with native support may be behind on the latest specification.
> Use `entry.contentRect` when switching between native and polyfilled versions.


## Resize loop detection

Resize Observers have inbuilt protection against infinite resize loops.

If an element's observed box size changes again within the same resize loop, the observation will be skipped and an error event will be dispatched on the window. Elements with undelivered notifications will be considered for delivery in the next loop.

```js
import ResizeObserver from '@juggle/resize-observer';

const ro = new ResizeObserver((entries, observer) => {
  // Changing the body size inside of the observer
  // will cause a resize loop and the next observation will be skipped
  document.body.style.width = '50%';
});

// Listen for errors
window.addEventListener('error', e => console.log(e.message));

// Observe the body
ro.observe(document.body);
```

## Notification Schedule
Notifications are scheduled after all other changes have occurred and all other animation callbacks have been called. This allows the observer callback to get the most accurate size of an element, as no other changes should occur in the same frame.

![resize observer notification schedule](https://user-images.githubusercontent.com/1519516/52825568-20433500-30b5-11e9-9854-4cee13a09a7d.jpg)



## How are differences detected?

To prevent constant polling, every frame. The DOM is queried whenever an event occurs which could cause an element to change its size. This could be when an element is clicked, a DOM Node is added, or, when an animation is running.

To cover these scenarios, there are two types of observation. The first is to listen to specific DOM events, including `resize`, `mousedown` and `focus` to name a few. The second is to listen for any DOM mutations that occur. This detects when a DOM node is added or removed, an attribute is modified, or, even when some text has changed.

This allows for greater idle time, when the application itself is idle.


## Features

- Inbuilt resize loop protection.
- Supports pseudo classes `:hover`, `:active` and `:focus`.
- Supports transitions and animations, including infinite and long-running.
- Detects changes which occur during animation frame.
- Includes support for latest draft spec - observing different box sizes.
- Polls only when required, then shuts down automatically, reducing CPU usage.
- Zero delay system - Notifications are batched and delivered immediately, before the next paint.


## Limitations

- Dynamic stylesheet changes may not be noticed.*
- Transitions with initial delays cannot be detected.*
- Animations and transitions with long periods of no change, will not be detected.*


## Tested Browsers

[chrome]: https://github.com/alrra/browser-logos/raw/master/src/chrome/chrome_64x64.png
[safari]: https://github.com/alrra/browser-logos/raw/master/src/safari/safari_64x64.png
[safari-ios]: https://github.com/alrra/browser-logos/raw/master/src/safari-ios/safari-ios_64x64.png
[ff]: https://github.com/alrra/browser-logos/raw/master/src/firefox/firefox_64x64.png
[opera]: https://github.com/alrra/browser-logos/raw/master/src/opera/opera_64x64.png
[opera-mini]: https://github.com/alrra/browser-logos/raw/master/src/opera-mini/opera-mini_64x64.png
[edge_12-18]: https://github.com/alrra/browser-logos/raw/master/src/archive/edge_12-18/edge_12-18_64x64.png
[edge]: https://github.com/alrra/browser-logos/raw/master/src/edge/edge_64x64.png
[samsung]: https://github.com/alrra/browser-logos/raw/master/src/samsung-internet/samsung-internet_64x64.png
[ie]: https://github.com/alrra/browser-logos/raw/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_64x64.png

### Desktop
| ![chrome][chrome] | ![safari][safari] | ![ff][ff] | ![opera][opera] | ![edge][edge] | ![edge][edge_12-18] | ![IE][ie] |
|--------|--------|---------|-------|------|------------|---------------------------------------|
| Chrome | Safari | Firefox | Opera | Edge | Edge 12-18 | IE11<br/>IE 9-10 (with polyfills)\*\* |

### Mobile
| ![chrome][chrome] | ![safari][safari] | ![ff][ff] | ![opera][opera] | ![opera mini][opera-mini] | ![edge][edge_12-18] | ![samsung internet][samsung] |
|--------|--------|---------|-------|------------|------|------------------|
| Chrome | Safari | Firefox | Opera | Opera Mini | Edge | Samsung Internet |

---

\*If other interaction occurs, changes will be detected.

\*\*IE10 requires additional polyfills for `Map` and `MutationObserver`. IE9 requires IE10 polyfills plus `requestAnimationFrame`. For more information, [see issue here](https://github.com/juggle/resize-observer/issues/64).
