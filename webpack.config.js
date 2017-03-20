const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

var DEVELOPMENT = process.env.NODE_ENV === 'development',
    PRODUCTION  = process.env.NODE_ENV === 'production'

var projectName =  DEVELOPMENT===true ? "[name].js"   : "[id].[chunkhash].js",
    styleName =    DEVELOPMENT===true ? "style/style.css" : "style.[hash:5].css"

const plugins = [
    new HtmlWebpackPlugin({
        template: './src/app/index.jade'
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: projectName ,
        filename: DEVELOPMENT===true ? "uniteJS/common.js" : "common.[hash].js"
    }),
    new ExtractTextPlugin(styleName),
    new webpack.HotModuleReplacementPlugin()
]

if(PRODUCTION===true){
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                sequences     : true,
                booleans      : true,
                loops         : true,
                unused      : true,
                warnings    : false,
                drop_console: true,
                unsafe      : true
            }
        })
    )
    plugins.push(
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: { discardComments: {removeAll: true } },
            canPrint: true
        })
    )
}

module.exports = {
    devtool: DEVELOPMENT===true ? 'source-map' : false,
    entry: path.resolve(__dirname,'src/app'),
    // library: '[name]',
    output: {
        path: DEVELOPMENT===true ? path.resolve(__dirname,'development') : path.resolve(__dirname,'production'),
        filename: projectName,
        chunkFilename: DEVELOPMENT===true ? "./chunk/[id].js" : "[id].[chunkhash].js"
    },
    module: {
        loaders: [
            {
                test: /\.jade$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['jade-loader']
            }, {
                test: /\.scss$/,
                exclude: /(node_modules|bower_components)/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader?sourceMap!sass-loader?sourceMap'})
            }, {
                test: /\.css$/,
                exclude: /(node_modules|bower_components)/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader:'style-loader',
                    loader:'css-loader?sourceMap'})
            }, {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [['es2015', {modules: false}]]
                }
            }, {
                test: /\.(png|jpg|gif)$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['file-loader?'+((DEVELOPMENT===true)
                    ? 'name=images/[name].[ext]'
                    : 'name=[ext]-[hash:8].[ext]')]
            }
        ]
    },
    devServer: {
        port: 8020
    },
    plugins: plugins
}
