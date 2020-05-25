const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "production",
    entry: {
        popup: './src/popup.tsx',
        content: './src/content.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: `${__dirname}/dist`,
    },
    module: {
        rules: [
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
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", ".css"]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public', to: './' }
            ],
        }),
    ],
};