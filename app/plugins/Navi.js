var location = 'home';

var Navi = function () {
	console.log('initializing navi');
};

Navi.prototype.init = function () {
	console.log('navi init start');
	var e = document.createElement('div');

	e.innerHTML = 'Navi plugin added';
	document.body.appendChild(e);
	e.classList.add('navi-plugin');

	app.api.loadData();
	console.log('navi init done');
};

// a normal method added to the prototype
Navi.prototype.goBack = function () {
	console.log('navigating back');
};

// a normal method added to the prototype
Navi.prototype.getLocation = function () {
	return location;
};


module.exports = Navi;