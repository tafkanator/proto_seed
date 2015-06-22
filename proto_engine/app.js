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
			var loader = new Loader();
			var parsedTemplate = template;
			var placeholders = [];
			var placeholderPaths = 0;

			function checkDone() {
				if (placeholderPaths === 0) {
					console.log('resolve')
					promise.resolve(parsedTemplate);
				}
			}

			function replacePlaceholder(placeholder, value) {
				parsedTemplate = parsedTemplate.replace('{{' + placeholder + '}}', value);
			}

			// find all {{placeholder}} tags
			template.replace(/\{{(.+?)\}}/g, function($0, $1) {
				placeholders.push($1);
			});

			// bind placeholders with values
			// placeholders starting with $ are paired with $values
			// everything else will be treated as file paths, load contents into them
			placeholders.forEach(function(placeholder) {
				if (placeholder[0] === '$') {
					replacePlaceholder(placeholder, $values[placeholder.substr(1)]);
				} else {
					placeholderPaths++;

					console.log('+', placeholderPaths)


					loader.get('/app/' + placeholder).then(function(placeholderHtml) {
						that.parse(placeholderHtml).then(function(parsedHtml) {
							replacePlaceholder(placeholder, parsedHtml);
							placeholderPaths--;
							console.log('-', parsedHtml)
							//
							checkDone();
						});
					});



					//console.log(placeholder, 'not implemented');
				}
			}.bind(this));

			checkDone();


			return promise;
		};

		return that;
	}

	function Loader() {
		var that = {};
		
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

		that.getAll = function(filenames) {
			var promise = new Promise();
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