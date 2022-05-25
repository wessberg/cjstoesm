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

export default [
	{
		input: "src/index.ts",
		preserveEntrySignatures: true,
		output: [
			{
				file: packageJson.main,
				format: "cjs",
				sourcemap: true
			},
			{
				file: packageJson.module,
				format: "esm",
				sourcemap: true
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
				format: "cjs",
				sourcemap: true
			}
		],
		...SHARED_OPTIONS
	}
];
