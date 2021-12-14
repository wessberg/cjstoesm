import {TestFile} from "./test-file";
import {TestContext} from "./test-context";
import {createTestSetup} from "./test-setup";
import {configureCommands} from "../../src/cli/configure-commands";
import {shouldDebug} from "../../src/transformer/util/should-debug";
import {createTestResult, TestResult} from "./test-result";
import {MaybeArray, PartialExcept} from "helpertypes";
import path from "crosspath";

export interface CliTestContext extends TestContext {
	args: string[];
	files: MaybeArray<TestFile>;
	noForcedOutDir: boolean;
}

/**
 * Prepares a test via the CLI
 */
export async function executeCli(options: PartialExcept<CliTestContext, "typescript">): Promise<TestResult> {
	const {
		context,
		fileSystem,
		fileStructure: {dir}
	} = createTestSetup(options.files ?? [], options);

	const args = options.args == null || options.args.length < 1 ? [] : [path.relative(dir.root, path.join(dir.src, options.args[0])), ...options.args.slice(1)];
	const result = createTestResult(dir);

	configureCommands({
		fileSystem,
		typescript: context.typescript,
		keepAliveOnError: true,
		args: [
			`/usr/local/bin/node`,
			"cjstoesm",
			...args,
			...(options.noForcedOutDir ?? false ? [] : [path.relative(dir.root, dir.dist)]),
			"--dry",
			`--cwd=${dir.root}`,
			...(shouldDebug(options.debug ?? false) ? ["--debug"] : [])
		],
		hooks: {
			writeFile(fileName: string, text: string) {
				result.files.push({fileName, text});
			}
		}
	});

	// Wait two microtasks
	for (let i = 0; i < 2; i++) {
		await Promise.resolve().then();
	}

	return result;
}
