import test from "ava";
import {withTypeScript} from "./util/ts-macro.js";
import {executeApi} from "./setup/execute-api.js";
import {formatCode} from "./util/format-code.js";

test.serial("Can transform one or more SourceFiles via the API. #1", withTypeScript, async (t, {typescript}) => {
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

	t.deepEqual(bundle.files.length, 2);
	t.deepEqual(
		formatCode(bundle.files[1].text),
		formatCode(`\
		import foo from "./foo.js";
		`)
	);
});
