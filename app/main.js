'use strict';
require('./gfx/style/main.scss');
var Navi = require('./plugins/Navi');
var Api = require('./plugins/Api');

// require plugins

window.app = {
	navi: new Navi(),
	api: new Api()
};


app.api.init();
app.navi.init();