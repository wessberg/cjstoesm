import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {executeApi} from "./setup/execute-api";
import {formatCode} from "./util/format-code";

test("Can transform one or more SourceFiles via the API. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await executeApi(
		[
			{
				entry: true,
				fileName: "index.js",
				text: `\
					const foo = require("./foo");
				`
			}
		],
		{typescript}
	);

	t.deepEqual(bundle.files.length, 1);
	t.deepEqual(
		formatCode(bundle.files[0].text),
		formatCode(`\
		import foo from "./foo";
		`)
	);
});
