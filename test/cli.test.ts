import test from "ava";
import {CommanderError} from "commander";
import {withTypeScript} from "./util/ts-macro.js";
import {executeCli} from "./setup/execute-cli.js";

test.serial("Will throw if no 'input' argument is given. #1", withTypeScript, async (t, {typescript}) => {
	await t.throwsAsync(executeCli({typescript, noForcedOutDir: true}), {
		instanceOf: CommanderError,
		code: "commander.missingArgument",
		message: `error: missing required argument 'input'`
	});
});

test.serial("Will match a file called 'index.js' with input argument: index.js. #1", withTypeScript, async (t, {typescript}) => {
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

	t.true(result.findFile("index.js") != null);
});

test.serial("Will match a file called 'index.js' with input argument: **.js. #1", withTypeScript, async (t, {typescript}) => {
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

	t.true(result.findFile("index.js") != null);
});
