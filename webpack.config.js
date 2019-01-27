const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./src/js/game.js",
    output: {
        filename: "game.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader, // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
			},
			{
				test: /\.(mp3)$/,
				use: [
				  {
					loader: 'file-loader',
					options: {},
				  },
				],
			  },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "index.css",
            chunkFilename: "id.css"
        })
    ]
};
