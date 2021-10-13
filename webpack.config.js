/**
 * Copyright (c) 2020 The UsaCon Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: {
        content: './src/content.ts',
        worker: './src/worker.ts',
        background: './src/background.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: `${__dirname}/dist`,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                    }
                ]
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", ".css"],
        fallback: {
            util: require.resolve("util"),
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
        }
    },
    ignoreWarnings: [
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
        /Failed to parse source map/,
    ],
    performance: {
        maxAssetSize: 30*1024*1024,
        maxEntrypointSize: 1*1024*1024,
    },

    devtool: "inline-source-map",
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: 'public', to: './'},
                {from: 'test', to: './'},
            ],
        }),
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
    ]
};