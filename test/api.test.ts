import {test} from "./util/test-runner.js";

import {executeApi} from "./setup/execute-api.js";
import {formatCode} from "./util/format-code.js";
import assert from "node:assert";

test("Can transform one or more SourceFiles via the API. #1", "*", async (_, {typescript}) => {
	const bundle = await executeApi(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `\
					const foo = require("./foo");
				`
			},
			{
				entry: false,
				fileName: "foo.js",
				text: `\
					export default {};
				`
			}
		],
		{typescript}
	);

	const file = bundle.files.find(file => file.fileName.endsWith("index.js"));
	assert.deepEqual(bundle.files.length, 2);
	assert.deepEqual(
		formatCode(file!.text),
		formatCode(`\
		import foo from "./foo.js";
		`)
	);
});
