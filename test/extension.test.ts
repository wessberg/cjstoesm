import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {generateTransformerResult} from "./setup/setup-transformer";
import {formatCode} from "./util/format-code";

test("Adds correct extensions for module specifiers for internal files when preserveModuleSpecifiers = 'external'. #1", withTypeScript, (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `
				const foo = require("./a");
			`
			},
			{
				entry: false,
				fileName: "a.mjs",
				text: `
				console.log("Hello, World!");
			`
			}
		],
		{typescript, preserveModuleSpecifiers: "external"}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import * as foo from "./a.mjs";
		`)
	);
});

test("Converts directory-imports to filenames for files with .js extensions when preserveModuleSpecifiers = 'external'. #1", withTypeScript, (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `
				const foo = require("./a");
			`
			},
			{
				entry: false,
				fileName: "a/index.js",
				text: `
				console.log("Hello, World!");
			`
			}
		],
		{typescript, preserveModuleSpecifiers: "external"}
	);
	const [, file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import * as foo from "./a/index.js";
		`)
	);
});

test("Converts directory-imports to absolute filenames for files with .js extensions when preserveModuleSpecifiers = 'never'. #1", withTypeScript, (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `
				const foo = require("./a");
			`
			},
			{
				entry: false,
				fileName: "a/index.js",
				text: `
				console.log("Hello, World!");
			`
			}
		],
		{typescript, preserveModuleSpecifiers: "never"}
	);
	const [, file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import * as foo from "./a/index.js";
		`)
	);
});

test("Preserves module specifiers pointing to internal files when preserveModuleSpecifiers = 'internal' #1", withTypeScript, (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `
				const foo = require("./a");
			`
			},
			{
				entry: false,
				fileName: "a.js",
				text: `
				console.log("Hello, World!");
			`
			}
		],
		{typescript, preserveModuleSpecifiers: "internal"}
	);
	const [, file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import * as foo from "./a";
		`)
	);
});

test("Drops module specifiers pointing to external files when preserveModuleSpecifiers = 'internal' #1", withTypeScript, (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `
				const foo = require("my-library");
			`
			},
			{
				entry: false,
				fileName: "../node_modules/my-library/package.json",
				text: `
				{
					"name": "my-library",
					"main": "index.js"
				}
			`
			},
			{
				entry: false,
				fileName: "../node_modules/my-library/index.js",
				text: `
				exports = 2;
			`
			}
		],
		{typescript, preserveModuleSpecifiers: "internal"}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import foo from "../node_modules/my-library/index.js";
		`)
	);
});
