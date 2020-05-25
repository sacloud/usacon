module.exports = {
    mode: "development",
    entry: {
        popup: './src/popup.tsx',
        content: './src/content.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: `${__dirname}/public`,
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
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", ".css"]
    },
    devServer: {
        contentBase: `${__dirname}/public`,
        watchContentBase: true,
        open: true,
        openPage:"popup.html"
    }
};