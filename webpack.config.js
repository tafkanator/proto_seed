var Webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: [
		path.resolve(__dirname, 'app', 'main.js')
	],

	output: {
		path: path.resolve(__dirname, 'app', 'build'),
		filename: 'bundle.js',
		publicPath:'/'
	},

	devServer: {
		contentBase: path.resolve(__dirname, 'app')
	},

	module: {
		loaders: [
			{test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'sass?sourceMap']},
			{test: /\.html$/, loader: 'raw'}
		]
	},

	sassLoader: {
		includePaths: [path.resolve(__dirname, 'app', 'gfx')]
	},

	plugins: [
		new Webpack.NoErrorsPlugin()
	],

	devtool: 'source-map'

};