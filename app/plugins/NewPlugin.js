var NewPlugin = function () {
	var e = document.createElement('div');

	e.innerHTML = 'NewPlugin plugin added';
	document.body.appendChild(e);
	e.classList.add('new-plugin-plugin');

	console.log('new plugin init done');
};

// a normal method added to the prototype
NewPlugin.prototype.doSomething = function () {
	var e = document.createElement('div');

	e.innerHTML = 'NewPlugin doSomething';
	document.body.appendChild(e);
	e.classList.add('new-plugin-plugin');
};

module.exports = new NewPlugin();