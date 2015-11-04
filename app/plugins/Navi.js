var location = 'home';

var Navi = function () {
	console.log('initializing navi');
};

Navi.prototype.init = function () {
	console.log('navi init start');
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