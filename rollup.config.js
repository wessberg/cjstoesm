import ts from "rollup-plugin-ts";
import packageJson from "./package.json";
import {builtinModules} from "module";

const SHARED_OPTIONS = {
	plugins: [
		ts({
			tsconfig: "tsconfig.build.json"
		})
	],
	external: [
		...builtinModules,
		...Object.keys(packageJson.dependencies),
		...Object.keys(packageJson.devDependencies),
		...Object.keys(packageJson.peerDependencies)
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
				file: packageJson.exports.require,
				format: "cjs",
				...SHARED_OUTPUT_OPTIONS
			},
			{
				file: packageJson.exports.import,
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
