import ts from "rollup-plugin-ts";
import pkg from "./package.json" assert {type: "json"};
import {builtinModules} from "module";

const SHARED_OPTIONS = {
	plugins: [
		ts({
			tsconfig: "tsconfig.build.json"
		})
	],
	external: [
		...builtinModules,
		...Object.keys(pkg.dependencies),
		...Object.keys(pkg.devDependencies),
		...Object.keys(pkg.peerDependencies)
	]
};

const SHARED_OUTPUT_OPTIONS = {
	sourcemap: true,
	hoistTransitiveImports: false,
	generatedCode: "es2015",
	compact: false,
	minifyInternalExports: false
};


export default [
	{
		input: "src/index.ts",
		preserveEntrySignatures: true,
		output: [
			{
				file: pkg.exports.require,
				format: "cjs",
				...SHARED_OUTPUT_OPTIONS
			},
			{
				file: pkg.exports.import,
				format: "esm",
				...SHARED_OUTPUT_OPTIONS
			}
		],
		...SHARED_OPTIONS
	},
	{
		input: "src/cli/index.ts",
		preserveEntrySignatures: true,
		output: [
			{
				dir: "./dist/cli",
				format: "esm",
				...SHARED_OUTPUT_OPTIONS
			}
		],
		...SHARED_OPTIONS
	}
];
