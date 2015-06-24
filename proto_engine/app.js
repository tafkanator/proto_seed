(function() {
	'use strict';
	
	function Promise () {
		var that = {};

		var thens = [];

		function complete (which, arg) {
			// switch over to sync then()
			that.then = which === 'resolve' ?
				function (resolve, reject) { resolve && resolve(arg); } :
				function (resolve, reject) { reject && reject(arg); };
			// disallow multiple calls to resolve or reject
			that.resolve = that.reject =
				function () { throw new Error('Promise already completed.'); };
			// complete all waiting (async) then()s
			var aThen, i = 0;
			while (aThen = thens[i++]) { aThen[which] && aThen[which](arg); }
			thens.length = 0;
		}


		that.then = function (onResolve, onReject) {
			// capture calls to then()
			thens.push({ resolve: onResolve, reject: onReject });
		};

		that.resolve = function (val) { complete('resolve', val); };

		that.reject = function (ex) { complete('reject', ex); };

		return that;
	}
	
	function Parser() {
		var that = {};

		that.parse = function(template, placeholderValues) {
			placeholderValues = placeholderValues || [];
			
			var promise = Promise();
			var parsedTemplate = template;
			var placeholders = [];
			var templates = [];
			
			function getTemplates() {
				var loader = Loader();
				var templatesPromise = Promise();
				var templatesToLoad = templates.length;
				
				// do recursve loop and replace all tags inside templates
				templates.forEach(function (template) {
					loader.get(template).then(function(html) {
						that.parse(html).then(function(parsedHtml) {
							placeholderValues[template] = parsedHtml;
							
							templatesToLoad--;
							
							if (templatesToLoad === 0) {
								templatesPromise.resolve();
							} 
						});
					});
				});
				
				return templatesPromise;
			}
			
			function replacePlaceholders() {
				parsedTemplate = template.replace(/\{{(.+?)\}}/g, function(match, p1) {
					if (p1[0] === '$') {
						p1 = p1.substr(1);
					}
					
					return placeholderValues[p1];
				});	
			}

			
			var matches = template.match(/\{{(.+?)\}}/g);
			
			if (matches !== null) {
				// find all {{placeholder}} tags
				matches.forEach(function(match) {
					var value = match.substr(2);
					value = value.substr(0, value.length - 2);
					
					if (value[0] === '$') {
						placeholders.push(value);
					} else {
						templates.push(value);
					}
				});
				
				// replace placeholders with values
				if (templates.length > 0) {
					getTemplates().then(function() {
						replacePlaceholders();
						promise.resolve(parsedTemplate);
					});
				} else {
					replacePlaceholders();
					promise.resolve(parsedTemplate);
				}
			} else {
				promise.resolve(template);
			}
			

			return promise;
		};

		return that;
	}

	function Loader() {
		var that = {};
		
		that.get = function(filename) {
			var promise = Promise();
			var xhr = new XMLHttpRequest();
			
			xhr.open('GET', filename + '.html', true);
			
			xhr.onload = function() {
				if (xhr.status == 200) {
					promise.resolve(xhr.response);
				} else {
					promise.reject(Error(xhr.statusText));
				}
			};
			
			xhr.onerror = function() {
				promise.reject(Error("Network Error"));
			};
			
			xhr.send();
			
			return promise;
		};

		that.getAll = function(filenames) {
			var promise = Promise();
			var donePromises = 0;
			var files = {};

			function checkDone() {
				donePromises++;

				if (donePromises >= filenames.length) {
					 promise.resolve(files);
				}

			}

			filenames.forEach(function(filename) {
				that.get(filename).then(function(file) {
					files[filename] = file;

					checkDone();
				});
			});

			return promise;
		};
		
		return that;
	}
	
	function Navi() {
		var that = {};
		
		that.open = function(templateName, pageName) {
			var template = that.getTemplateName();		
			var page = that.getPageName();		
		};
		
		that.getTemplateName = function() {
			return 'default';
		};
		
		that.getPageName = function() {
			return 'home';
		};
		
		
		return that;
	}
	
	document.addEventListener("DOMContentLoaded", function() {
		var parser = Parser();
		var loader = Loader();
		var navi = Navi();
		
		var templateWrapDom = document.querySelector('body').innerHTML;
		
		var templateName = '/app/templates/' +  navi.getTemplateName() || 'default';
		var pageName ='/app/pages/' + navi.getPageName() || 'home';

		// load page
		loader.getAll([templateName, pageName]).then(function(files) {
			var template = files[templateName];
			var page = files[pageName];

			parser.parse(template, {
				page: page
			}).then(function(pageHtml) {
				parser.parse(templateWrapDom, {
					template: pageHtml
				}).then(function (html) {
					document.querySelector('body').innerHTML = html;
				});
			});
		});
	});
	
} ());