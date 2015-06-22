(function() {
	'use strict';
	
	var rootPath = './';
	
	function Promise () {
		this._thens = [];
	}
	 
	Promise.prototype = {
		then: function (onResolve, onReject) {
			// capture calls to then()
			this._thens.push({ resolve: onResolve, reject: onReject });
		},
	 
		resolve: function (val) { this._complete('resolve', val); },
	 
		reject: function (ex) { this._complete('reject', ex); },
	 
		_complete: function (which, arg) {
			// switch over to sync then()
			this.then = which === 'resolve' ?
				function (resolve, reject) { resolve && resolve(arg); } :
				function (resolve, reject) { reject && reject(arg); };
			// disallow multiple calls to resolve or reject
			this.resolve = this.reject = 
				function () { throw new Error('Promise already completed.'); };
			// complete all waiting (async) then()s
			var aThen, i = 0;
			while (aThen = this._thens[i++]) { aThen[which] && aThen[which](arg); }
			delete this._thens;
		}
	};
	
	function Parser() {
		var that = {};

		that.parse = function(template, $values) {
			var promise = new Promise();
			var parsedTemplate = template;
			var placeholders = [];

			// find all {{placeholder}} tags
			template.replace(/\{{(.+?)\}}/g, function($0, $1) {
				placeholders.push($1);
			});

			// bind placeholders with values
			// placeholders starting with $ are paired with $values
			// everything else will be treated as file paths, load contents into them
			placeholders.forEach(function(placeholder) {
				if (placeholder[0] === '$') {
					parsedTemplate = parsedTemplate.replace(
						'{{' + placeholder + '}}',
						$values[placeholder.substr(1)]
					);
				} else {
					console.log(placeholder, 'not implemented');
				}
			}.bind(this));

			promise.resolve(parsedTemplate);

			return promise;
		};

		return that;
	}

	function Loader() {
		var that = {};
		var baseUrl = location.protocol + '//' + location.host;
		
		that.get = function(filename) {
			var promise = new Promise();
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
		
		var templateName = navi.getTemplateName() || 'default';
		var pageName = navi.getPageName() || 'home';
		
		// load page

		loader.get('/app/templates/' + templateName).then(function templateLoaded(template) {
			loader.get('/app/pages/' + pageName).then(function pageLoaded(pageTemplate) {
				// load data into page
				parser.parse(template, {
					page: pageTemplate
				}).then(function parsePage(pageHtml) {
					parser.parse(templateWrapDom, {
						template: pageHtml
					}).then(function addCodeToHtml(html) {
						 document.querySelector('body').innerHTML = html; 
					});
				});
			});
		});
	});
	
} ());