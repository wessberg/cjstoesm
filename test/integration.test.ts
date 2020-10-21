import test from "./util/test-runner";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Can bundle Commonjs. #1", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
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
		{external: () => false},
		{typescript}
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

test("Can treeshake Commonjs. #1", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
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
		{external: () => false},
		{typescript}
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

test("Can treeshake Commonjs. #2", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
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
		{external: () => false},
		{typescript}
	);
	const [file] = bundle.output;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			const foo = 2;

			const foo$1 = {foo: foo}.foo;
			console.log(foo$1);
		`)
	);
});

test("Can treeshake Commonjs. #3", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
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
		{external: () => false},
		{typescript}
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
