# MathJax

MathJax in Meteor. Configurable with [extensions](http://mathjax.readthedocs.org/en/latest/options/ThirdParty.html).

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Script Choice](#script-choice)
  - [MathJax Configuration](#mathjax-configuration)
  - [Caching Content](#caching-content)
  - [Extensions](#extensions)
  - [Equation Numbering](#equation-numbering)
  - [Typesetting Callbacks](#typesetting-callbacks)
  - [Pre-loading](#pre-loading)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

This is available as [`convexset:mathjax`](https://atmospherejs.com/convexset/mathjax) on [Atmosphere](https://atmospherejs.com/). (Install with `meteor add convexset:mathjax`.)

If you get an error message like:
```
WARNING: npm peer requirements not installed:
 - package-utils@^0.2.1 not installed.
          
Read more about installing npm peer dependencies:
  http://guide.meteor.com/using-packages.html#peer-npm-dependencies
```
It is because, by design, the package does not include instances of these from `npm` to avoid repetition. (In this case, `meteor npm install --save package-utils`.)

See [this](http://guide.meteor.com/using-packages.html#peer-npm-dependencies) or [this](https://atmospherejs.com/tmeasday/check-npm-versions) for more information.

Now, if you see a message like
```
WARNING: npm peer requirements not installed:
underscore@1.5.2 installed, underscore@^1.8.3 needed
```
it is because you or something you are using is using Meteor's cruddy old `underscore` package. Install a new version from `npm`. (And, of course, you may use the `npm` version in a given scope via `require("underscore")`.)


## Usage

So...

```html
Standard display math:
{{#mathjax}}
  $$
    \|x\|\|y\| \ge x^{T}y
  $$
{{/mathjax}}

This can be used to generate numbered equations:
{{#mathjax}}
  \begin{equation}
    \|x\|\|y\| \ge x^{T}y
  \end{equation}
{{/mathjax}}

Inline math is as easy as {{#mathjax}}$\alpha\beta\gamma${{/mathjax}}.
```

## Configuration

### Script Choice

Set the script to load at `MathJaxHelper.script` **before the first use**.
A list of script load URLs (served from the CDN) can be found at `MathJaxHelper.SCRIPT_SRC`.

### MathJax Configuration

Set the configuration to use at `MathJaxHelper.config` **before the first use**.
Call `MathJaxHelper.useDefaultConfig()` to use the default configuration.
Default configuration:
```javascript
{
    tex2jax: {
        inlineMath: [
            ['$', '$'],
            ["\\(", "\\)"]
        ],
        displayMath: [
            ['$$', '$$'],
            ["\\[", "\\]"]
        ],
    },
    TeX: {
        extensions: [
            "AMSmath.js",
            "AMSsymbols.js",
        ],
        equationNumbers: {
            autoNumber: "AMS"
        },
    },
    skipStartupTypeset: true,
    processEscapes: true,
    showProcessingMessages: true,
    messageStyle: "normal",
}
```

### Caching Content

Set `MathJaxHelper.cacheResults` to `true` to cache the results of typesetting. (Default: `false`)

Call `MathJaxHelper.clearCache()` to clear the cache.

Use `MathJaxHelper.cacheSize` to set the cache size.

### Extensions

Call `MathJaxHelper.useExtensions(arrayOfExtensions)` to select a list of extensions to use. (See [this](http://mathjax.readthedocs.org/en/latest/options/ThirdParty.html) for more information.)

Items from the [MathJax third-party extensions repository](https://github.com/mathjax/MathJax-third-party-extensions) can be loaded by name (e.g.: `"xyjax"` and `"img"`) instead of by the full URL (e.g.: `"http://sonoisa.github.io/xyjax_ext/xypic.js"`).

For a list of extensions from the [MathJax third-party extensions repository](https://github.com/mathjax/MathJax-third-party-extensions) may be found in `MathJaxHelper.MATHJAX_CONTRIB_EXTENSIONS_LIST`. Currently, this list is:
```javascript
[
    "counters", "everymath", "forloop", "forminput",
    "img", "knowl", "longdiv", "modifymenu", "physics",
    "preamble", "siunitx", "sqrtspacing", "toggles", "xyjax"
]
```

### Equation Numbering

To reset equation numbers: `MathJaxHelper.resetEquationNumbers()` (Easy, right?)

### Typesetting Callbacks

To add a callback to be executed before typesetting, call: `MathJaxHelper.addPreTypesettingCallback(callbackFunction)`

Callback functions are called with a single argument of the form
```javascript
{
    cacheKey: cacheKey,  // if the cache is used
    originalText: originalNodeContent,
    node: node
}
```

To add a callback to be executed after typesetting, call: `MathJaxHelper.addPostTypesettingCallback(callbackFunction)`

Callback functions are called with a single argument of the form
```javascript
{
    cacheKey: cacheKey,  // if the cache is used
    originalText: originalNodeContent,
    fromCache: true,  // ... or false, depending on whether there was a cache hit
                      // available if the cache is used
    node: node
}
```

### Pre-loading

Here is a useful way to preload things:
```javascript
Meteor.startup(function() {
    MathJaxHelper.onMathJaxReady(function(MathJax) {
        // Warm Up the type setter
        var div = document.createElement('div');
        div.innerHTML = "$x$";
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, div], function() {
            console.info("MathJax loaded.");
        });
    });
});
```