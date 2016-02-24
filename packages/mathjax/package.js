Package.describe({
	name: 'convexset:mathjax',
	version: '0.1.3',
	summary: 'MathJax for Meteor. Configurable. Extensible.',
	git: 'https://github.com/convexset/meteor-mathjax',
	documentation: '../../README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	api.use('convexset:package-utils@0.1.9');
	api.use([
		'ecmascript',
		'ejson',
		'underscore',
		'jquery',
		'templating',
		'jparker:crypto-core@0.1.0',
		'jparker:crypto-sha1@0.1.0',
	], 'client');
	api.addFiles([
		'mathjax.html',
		'mathjax.js',
	], 'client');

	api.export("MathJaxHelper");
});