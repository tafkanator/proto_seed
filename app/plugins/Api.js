var Api = function () {
	console.log('initializing navi');
};

Api.prototype.init = function () {
	console.log('api init done');
};

// a normal method added to the prototype
Api.prototype.loadData = function () {
	console.log('api data loaded');
};

module.exports = Api;