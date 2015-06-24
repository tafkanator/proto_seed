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
		var currentTemplate = '';
		var currentPage = '';

		var eventListeners = [];

		function getUrlParams() {
			var hash = location.hash;
			var pieces = hash.split('/');

			return {
				template: pieces[1],
				page: pieces[2]
			};
		}

		function onHashChange() {
			var urlParams = getUrlParams();

			currentTemplate = urlParams.template;
			currentPage = urlParams.page;

			eventListeners.forEach(function(listener) {
				listener(that.getTemplateName(), that.getPageName());
			});
		}

		that.init = function() {
			window.addEventListener("hashchange", onHashChange, false);

			var urlParams = getUrlParams();

			if (!urlParams.template || !urlParams.page) {
				that.open('default', 'home');
			} else {
				onHashChange();
			}
		};

		that.onUrlChange = function(callBack) {
			eventListeners.push(callBack);
		};

		that.open = function(templateName, pageName) {
			if (templateName === currentTemplate && pageName === currentPage) {
				return;
			}

			window.location.href = '/#/' + templateName + '/' + pageName;
		};
		
		that.getTemplateName = function() {
			return '/app/templates/' + currentTemplate;
		};
		
		that.getPageName = function() {
			return '/app/pages/' + currentPage;
		};
		
		
		return that;
	}
	
	document.addEventListener("DOMContentLoaded", function() {
		var parser = Parser();
		var loader = Loader();
		var navi = Navi();

		var documentBody = document.querySelector('body');
		var templateWrapDom = documentBody.innerHTML;

		function changePage(templateUrl, pageUrl) {
			loader.getAll([templateUrl, pageUrl]).then(function(files) {
				var template = files[navi.getTemplateName()];
				var page = files[navi.getPageName()];

				parser.parse(template, {
					page: page
				}).then(function(pageHtml) {
					parser.parse(templateWrapDom, {
						template: pageHtml
					}).then(function (html) {
						documentBody.innerHTML = html;
					});
				});
			});
		}

		navi.onUrlChange(function(template, page) {
			changePage(template, page);
		});

		navi.init();
	});
	
} ());