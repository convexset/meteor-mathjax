/* global PackageUtilities: true */
/* global MathJaxHelper: true */
/* global MathJax: true */

MathJaxHelper = (function() {
	var _mjh = function MathJaxHelper() {};
	var mjh = new _mjh();

	var DEFAULT_CONFIG = {
		tex2jax: {
			inlineMath: [
				['$', '$'],
				["\\(", "\\)"]
			],
			displayMath: [
				['$$', '$$'],
				["\\[", "\\]"]
			],
			skipStartupTypeset: true,
			processEscapes: true,
			showProcessingMessages: false,
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
	};

	// https://github.com/mathjax/MathJax-third-party-extensions
	var MATHJAX_CONTRIB_EXTENSIONS_PREFIX = "https://cdn.mathjax.org/mathjax/contrib/";
	var MATHJAX_CONTRIB_EXTENSIONS = {
		"counters": "counters/counters.js",
		"everymath": "everymath/everymath.js",
		"forloop": "forloop/forloop.js",
		"forminput": "forminput/forminput.js",
		"img": "img/img.js",
		"knowl": "knowl/knowl.js",
		"longdiv": "longdiv/longdiv.js",
		"modifymenu": "modifymenu/modifymenu.js",
		"physics": "physics/physics.js",
		"preamble": "preamble/preamble.js",
		"siunitx": "siunitx/siunitx.js",
		"sqrtspacing": "sqrtspacing/sqrtspacing.js",
		"toggles": "toggles/toggles.js",
		"xyjax": "xyjax/xypic.js",
	};
	PackageUtilities.addImmutablePropertyArray(mjh, "MATHJAX_CONTRIB_EXTENSIONS_LIST", Object.keys(MATHJAX_CONTRIB_EXTENSIONS));

	// https://docs.mathjax.org/en/v2.5-latest/config-files.html
	PackageUtilities.addImmutablePropertyArray(mjh, "SCRIPT_SRC", [
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=default",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=MML_HTMLorMML",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=AM_HTMLorMML",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG",
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=Accessible",
	]);

	var _script = mjh.SCRIPT_SRC[0];
	var _config = PackageUtilities.deepCopy(DEFAULT_CONFIG);

	PackageUtilities.addPropertyGetterAndSetter(mjh, "script", {
		get: () => _script,
		set: (value) => {
			if (!_scriptLoaded) {
				_script = value;
			}
		},
	});

	PackageUtilities.addPropertyGetterAndSetter(mjh, "config", {
		get: () => PackageUtilities.deepCopy(_config),
		set: (value) => {
			if (!_configLoaded) {
				_config = value;
			}
		},
	});

	var _scriptLoaded = false;
	PackageUtilities.addImmutablePropertyFunction(mjh, "loadScript", function loadScript() {
		_scriptLoaded = true;
		return mjh.script;
	});

	var _configLoaded = false;
	PackageUtilities.addImmutablePropertyFunction(mjh, "loadConfig", function loadConfig() {
		_configLoaded = true;
		return mjh.config;
	});

	PackageUtilities.addImmutablePropertyFunction(mjh, "useDefaultConfig", function useDefaultConfig() {
		_config = PackageUtilities.deepCopy(DEFAULT_CONFIG);
	});

	PackageUtilities.addImmutablePropertyFunction(mjh, "useExtensions", function useExtensions(ext) {
		_config = PackageUtilities.deepCopy(DEFAULT_CONFIG);
		// "http://sonoisa.github.io/xyjax_ext/xypic.js"
		// "https://rawgit.com/sonoisa/XyJax/master/extensions/TeX/xypic.js"

		_.forEach(ext, function(extNameOrSrc) {
			if (Object.keys(MATHJAX_CONTRIB_EXTENSIONS).indexOf(extNameOrSrc) !== -1) {
				_config.TeX.extensions.push(MATHJAX_CONTRIB_EXTENSIONS_PREFIX + MATHJAX_CONTRIB_EXTENSIONS[extNameOrSrc]);
			} else {
				_config.TeX.extensions.push(extNameOrSrc);
			}
		});

	});

	PackageUtilities.addImmutablePropertyFunction(mjh, "setDebugConfig", function setDebugConfig() {
		_config.tex2jax.showProcessingMessages = true;
	});

	PackageUtilities.addImmutablePropertyFunction(mjh, "unsetDebugConfig", function unsetDebugConfig() {
		_config.tex2jax.showProcessingMessages = false;
	});

	PackageUtilities.addImmutablePropertyFunction(mjh, "makeId", function makeId(o) {
		return CryptoJS.SHA1((typeof o) + '_' + EJSON.stringify(o, {
			canonical: true
		})).toString(CryptoJS.enc.Base64);
	});

	var _firstRun = true;
	PackageUtilities.addImmutablePropertyFunction(mjh, "resetEquationNumbers", function resetEquationNumbers() {
		onMathJaxReady(function(MathJax) {
			if (!_firstRun) {
				MathJax.Hub.Queue(
					["resetEquationNumbers", MathJax.InputJax.TeX], ["PreProcess", MathJax.Hub], ["Reprocess", MathJax.Hub]
				);
			}
			_firstRun = false;
		});
	});

	return mjh;
})();


// Load MathJax
function onMathJaxReady(callback) {
	if (window.MathJax) {
		callback(window.MathJax);
	} else {
		if (!onMathJaxReady.listeners) {
			$.getScript(MathJaxHelper.loadScript()).done(function() {
				MathJax.Hub.Config(MathJaxHelper.loadConfig());
				while (onMathJaxReady.listeners.length > 0) {
					onMathJaxReady.listeners.pop().call(null, window.MathJax);
				}
			});
			onMathJaxReady.listeners = [];
		}
		onMathJaxReady.listeners.push(callback);
	}
}


// Typeset with Cache
var _cache = {};
var doCachedTypeset = function(firstNode, lastNode) {
	var alreadyArrivedAtFirstNode = false;

	$(firstNode).parent().contents().each(function(index, node) {
		var cacheKey;
		if (node === firstNode) {
			alreadyArrivedAtFirstNode = true;
		}
		if (alreadyArrivedAtFirstNode && (node.nodeType === 1)) {
			var nodeContent = node.innerHTML;
			cacheKey = MathJaxHelper.makeId(nodeContent);

			// Do Not Use Cache
			var reprocess = false;
			// equation blocks
			reprocess = reprocess || ((nodeContent.toLowerCase().indexOf("\\begin{equation}") > -1) && (nodeContent.toLowerCase().indexOf("\\end{equation}") > -1));
			// multline blocks
			reprocess = reprocess || ((nodeContent.toLowerCase().indexOf("\\begin{multline}") > -1) && (nodeContent.toLowerCase().indexOf("\\end{multline}") > -1));
			// gather blocks
			reprocess = reprocess || ((nodeContent.toLowerCase().indexOf("\\begin{gather}") > -1) && (nodeContent.toLowerCase().indexOf("\\end{gather}") > -1));
			// align blocks
			reprocess = reprocess || ((nodeContent.toLowerCase().indexOf("\\begin{align}") > -1) && (nodeContent.toLowerCase().indexOf("\\end{align}") > -1));
			// tags
			var tagRegex = /\tag{[A-Za-z_]+}/;
			reprocess = reprocess || tagRegex.test(nodeContent.toLowerCase());

			if (!reprocess && (typeof _cache[cacheKey] !== "undefined")) {
				node.innerHTML = _cache[cacheKey];
			} else {
				MathJax.Hub.Queue(["Typeset", MathJax.Hub, node], function() {
					_cache[cacheKey] = node.innerHTML;
				});
			}
		}
		return node !== lastNode;
	});
};

var MathJaxTemplates = [
	Template.mathjax,
	Template.mathjaxDiv,
	Template.mathjaxSpan,
];

MathJaxTemplates.forEach(function(tmpl) {
	tmpl.onRendered(function() {
		var instance = this;
		onMathJaxReady(function() {
			// Meteor.defer(function() {
			doCachedTypeset(instance.firstNode, instance.lastNode);
			// });
		});
	});
});