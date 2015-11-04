var newPlugin = require('./NewPlugin');

var Api = function () {
	console.log('initializing navi');
};

Api.prototype.init = function () {
	var e = document.createElement('div');

	e.innerHTML = 'Api plugin added';
	document.body.appendChild(e);
	e.classList.add('api-plugin');

	console.log('api init done');
};

// a normal method added to the prototype
Api.prototype.loadData = function () {
	var e = document.createElement('div');

	e.innerHTML = 'Api plugin loadData';
	document.body.appendChild(e);
	e.classList.add('api-plugin');

	newPlugin.doSomething();

	console.log('api data loaded');


};

module.exports = Api;