var Webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: [
		'webpack/hot/dev-server',
		'webpack-dev-server/client?http://localhost:8080',
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
		new Webpack.HotModuleReplacementPlugin(),
		new Webpack.NoErrorsPlugin()
	],

	devtool: 'source-map'

};