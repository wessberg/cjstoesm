import {test} from "./util/test-runner.js";
import {CommanderError} from "commander";
import {executeCli} from "./setup/execute-cli.js";
import assert from "node:assert";

test("Will throw if no 'input' argument is given. #1", "*", async (_, {typescript}) => {
	await assert.rejects(executeCli({typescript, noForcedOutDir: true}), CommanderError);
});

test("Will match a file called 'index.js' with input argument: index.js. #1", "*", async (_, {typescript}) => {
	const result = await executeCli({
		files: [
			{
				fileName: "index.js",
				text: `require("./foo")`
			}
		],
		args: ["index.js"],
		typescript
	});

	assert(result.findFile("index.js") != null);
});

test("Will match a file called 'index.js' with input argument: **.js. #1", "*", async (_, {typescript}) => {
	const result = await executeCli({
		files: [
			{
				fileName: "index.js",
				text: `require("./foo")`
			}
		],
		args: ["**.js"],
		typescript
	});

	assert(result.findFile("index.js") != null);
});
