const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: ['./src/app.ts', './styles/style.scss'],
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	devServer: {
		static: './dist',
		compress: true,
		port: 9000,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'assets/fonts', to: 'fonts' },
				{ from: 'assets/images', to: 'images' },
				{ from: 'templates', to: 'templates' },
			],
		}),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,

				type: 'asset/resource',
				generator: {
					filename: 'css/[name].min.css',
				},
				use: ['sass-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
}
