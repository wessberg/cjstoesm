import {test} from "./util/test-runner.js";
import {executeTransformer} from "./setup/execute-transformer.js";
import {formatCode} from "./util/format-code.js";
import assert from "node:assert";

test("Generates an import with a default import binding from JSON modules. #1", "*", (_, {typescript}) => {
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
		{typescript, importAttributes: false}
	);
	const [file] = bundle.files;
	assert.deepEqual(
		formatCode(file!.text),
		formatCode(`\
		import foo from "./foo.json";
		`)
	);
});
