Package.describe({
	name: 'convexset:mathjax',
	version: '0.1.3_4',
	summary: 'MathJax for Meteor. Configurable. Extensible.',
	git: 'https://github.com/convexset/meteor-mathjax',
	documentation: '../../README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.3.1');
	api.use([
		'ecmascript',
		'ejson',
		'underscore',
		'jquery',
		'templating',
		'tmeasday:check-npm-versions@0.3.1',
		'jparker:crypto-core@0.1.0',
		'jparker:crypto-sha1@0.1.0',
	], 'client');
	api.addFiles([
		'mathjax.html',
		'mathjax.js',
	], 'client');

	api.export("MathJaxHelper");
});