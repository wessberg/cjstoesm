import test from "ava";
import {withTypeScriptVersions} from "./util/ts-macro.js";
import {executeTransformer} from "./setup/execute-transformer.js";
import {formatCode} from "./util/format-code.js";

test.serial("Adds correct import assertions for module specifiers when importAssertions are enabled. #1", withTypeScriptVersions(">=4.5"), (t, {typescript}) => {
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
		{typescript, importAssertions: true}
	);
	const [file] = bundle.files;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import foo from "./foo.json" assert {type: "json"};
		`)
	);
});
