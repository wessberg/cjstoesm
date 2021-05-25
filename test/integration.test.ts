import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {executeRollup} from "./setup/execute-rollup";

test("Can bundle Commonjs. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await executeRollup(
		[
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
			module.exports = 2; 
			`
			},
			{
				entry: true,
				fileName: "index.ts",
				text: `\
			console.log(require("./foo")); 
			`
			}
		],
		{
			typescript,
			rollupOptions: {
				external: () => false
			}
		}
	);
	const [file] = bundle.output;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		var foo = 2;
		
		console.log(foo);
		`)
	);
});

test("Can treeshake Commonjs. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await executeRollup(
		[
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
			function includedFunction () {}
			function excludedFunction () {}
			exports.includedFunction = includedFunction;
			`
			},
			{
				entry: true,
				fileName: "index.ts",
				text: `\
			const {includedFunction} = require("./foo");
			console.log(includedFunction);
			`
			}
		],
		{
			typescript,
			rollupOptions: {
				external: () => false
			}
		}
	);
	const [file] = bundle.output;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		function includedFunction () {}

		console.log(includedFunction);
		`)
	);
});

test("Can treeshake Commonjs. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await executeRollup(
		[
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
			const foo = 2;
			module.exports = {
				foo,
				bar: () => {}
			};
			`
			},
			{
				entry: true,
				fileName: "index.ts",
				text: `\
			const foo = require("./foo").foo;
			console.log(foo);
			`
			}
		],
		{
			typescript,
			rollupOptions: {external: () => false}
		}
	);
	const [file] = bundle.output;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			const foo$1 = 2;

			const foo = {foo: foo$1}.foo;
			console.log(foo);
		`)
	);
});

test("Can treeshake Commonjs. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await executeRollup(
		[
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
			module.exports = {
				foo: 2,
				bar: () => {}
			};
			`
			},
			{
				entry: true,
				fileName: "index.ts",
				text: `\
			const {bar} = require("./foo");
			console.log(bar);
			`
			}
		],
		{
			typescript,
			rollupOptions: {
				external: () => false
			}
		}
	);
	const [file] = bundle.output;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		const bar = () => {};

		console.log(bar);
		`)
	);
});
