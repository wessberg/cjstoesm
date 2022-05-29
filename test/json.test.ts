import test from "ava";
import {withTypeScript} from "./util/ts-macro.js";
import {executeTransformer} from "./setup/execute-transformer.js";
import {formatCode} from "./util/format-code.js";

test.serial("Generates an import with a default import binding from JSON modules. #1", withTypeScript, (t, {typescript}) => {
	const bundle = executeTransformer(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo.json");
			`
			},
			{
				entry: true,
				fileName: "foo.json",
				text: `
				{}
			`
			}
		],
		{typescript, importAssertions: false}
	);
	const [file] = bundle.files;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo.json";
		`)
	);
});