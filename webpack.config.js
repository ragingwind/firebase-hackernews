const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: {
		'firebase-hackernews-sw': './src/firebase-hackernews-sw.js',
		'firebase-hackernews': './src/firebase-hackernews.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './dist'),
		libraryTarget: "umd",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					presets: ['es2015']
				}
			}
		]
	}
};
