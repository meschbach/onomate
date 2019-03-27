const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	module: {
		rules: [
			{
				include: [path.resolve(__dirname, 'angular', 'app')],
				loader: 'babel-loader',

				options: {
					plugins: ['syntax-dynamic-import'],

					presets: [
						[
							'@babel/preset-env',
							{
								modules: false
							}
						]
					]
				},

				test: /\.js$/
			},
			{
				test: /\.css$/,

				use: [
					{
						loader: 'style-loader',

						options: {
							sourceMap: true
						}
					},
					{
						loader: "css-loader"
					}
				]
			},
			{
				test: /\.svg$/,

				use: [
					{
						loader: 'svg-inline-loader',
						options: {
							limit: 1024
						}
					}
				]
			},
			{
				test: /\.(ttf|eot|woff)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							limit: 1024,
							name: './font/[hash].[ext]',
							mimetype: 'application/font-woff'
						}
					}
				]
			},
			{
				test: /\.html$/,
				use: [{
						loader: 'html-loader',
					}],
			}
		]
	},

	entry: {
		main: './angular/app/main.js'
	},

	output: {
		path: __dirname + "/../browser",
		filename: '[name].js'
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	},

	plugins: [
		new HtmlWebPackPlugin({
			template: "./angular/app/index.html"
		})
	]
};
