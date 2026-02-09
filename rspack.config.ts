import { defineConfig } from "@rspack/cli";
import rspack from "@rspack/core";
import { config } from "dotenv";
import { TsCheckerRspackPlugin } from "ts-checker-rspack-plugin";
import packages from "./package.json";

// Load environment variables from .env file
config();

export default defineConfig({
    devtool: process.env.NODE_ENV === "production" ? false : "source-map",
    entry: {
        main: "./packages/chili-web/src/index.ts",
    },
    devServer: {
        historyApiFallback: true,
        port: 8081,
    },
    experiments: {
        css: true,
    },
    module: {
        parser: {
            "css/auto": {
                namedExports: false,
            },
        },
        rules: [
            {
                test: /\.wasm$/,
                type: "asset",
            },
            {
                test: /\.cur$/,
                type: "asset",
            },
            {
                test: /\.jpg$/,
                type: "asset",
            },
            {
                test: /\.(j|t)s$/,
                loader: "builtin:swc-loader",
                options: {
                    jsc: {
                        parser: {
                            syntax: "typescript",
                            decorators: true,
                        },
                        target: "esnext",
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js", ".json", ".wasm"],
    },
    plugins: [
        new TsCheckerRspackPlugin(),
        new rspack.CircularDependencyRspackPlugin({
            failOnError: true,
            exclude: /node_modules/,
        }),
        new rspack.CopyRspackPlugin({
            patterns: [
                {
                    from: "./public",
                    globOptions: {
                        ignore: ["**/**/index.html"],
                    },
                },
            ],
        }),
        new rspack.DefinePlugin({
            __APP_VERSION__: JSON.stringify(packages.version),
            __DOCUMENT_VERSION__: JSON.stringify(packages.documentVersion),
            __IS_PRODUCTION__: JSON.stringify(process.env.NODE_ENV === "production"),
            "process.env.VITE_FIREBASE_API_KEY": JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
            "process.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
            "process.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
            "process.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
                process.env.VITE_FIREBASE_STORAGE_BUCKET,
            ),
            "process.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
                process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            ),
            "process.env.VITE_FIREBASE_APP_ID": JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
            "process.env.VITE_FIREBASE_MEASUREMENT_ID": JSON.stringify(
                process.env.VITE_FIREBASE_MEASUREMENT_ID,
            ),
        }),
        new rspack.HtmlRspackPlugin({
            template: "./public/index.html",
            inject: "body",
        }),
    ],
    optimization: {
        minimizer: [
            new rspack.SwcJsMinimizerRspackPlugin({
                minimizerOptions: {
                    mangle: {
                        keep_classnames: true,
                        keep_fnames: true,
                    },
                },
            }),
            new rspack.LightningCssMinimizerRspackPlugin(),
        ],
    },
    output: {
        clean: true,
    },
});
