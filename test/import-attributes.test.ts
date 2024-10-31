import {test} from "./util/test-runner.js";
import {executeTransformer} from "./setup/execute-transformer.js";
import {formatCode} from "./util/format-code.js";
import assert from "node:assert";

test("Adds correct import attributes for module specifiers when importAttriutes are enabled. #1", ">=5.3", (_, {typescript}) => {
	const bundle = executeTransformer(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `
				const foo = require("./foo.json");
			`
			},
			{
				entry: false,
				fileName: "foo.json",
				text: `
				{}
			`
			}
		],
		{typescript, importAttributes: true}
	);
	const file = bundle.files.find(file => file.fileName.endsWith("index.js"));

	assert.deepEqual(
		formatCode(file!.text),
		formatCode(`\
			import foo from "./foo.json" with {type: "json"};
		`)
	);
});
