import {TransformTaskOptions} from "./transform-task-options";
import {CONSTANT} from "../../constant/constant";
import {inspect} from "util";
import {sync} from "glob";
import {dirname, isAbsolute, join, relative} from "path";
import {TS} from "../../../type/ts";
import {cjsToEsm} from "../../../transformer/cjs-to-esm";
import {TransformResult} from "../../../type/transform-result";

/**
 * Executes the 'generate' task
 */
export async function transformTask({logger, input, outDir, cwd, fileSystem, typescript}: TransformTaskOptions): Promise<TransformResult> {
	if (input == null) {
		throw new ReferenceError(`Missing required argument: 'input'`);
	}

	logger.debug(inspect({input, outDir, cwd}, CONSTANT.inspectOptions));

	// Match files based on the glob
	const matchedFiles = new Set(sync(input).map(file => (isAbsolute(file) ? file : join(cwd, file))));
	logger.debug(`Matched files:`, matchedFiles.size < 1 ? "(none)" : [...matchedFiles].map(f => `"${f}"`).join(", "));

	// Prepare the result object
	const result: TransformResult = {
		files: []
	};

	// Prepare CompilerOptions
	const options: TS.CompilerOptions = {
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		declaration: false,
		outDir,
		sourceMap: false,
		newLine: typescript.sys.newLine === "\n" ? typescript.NewLineKind.LineFeed : typescript.NewLineKind.CarriageReturnLineFeed,
		rootDir: cwd
	};

	// Create a TypeScript program based on the glob
	const program = typescript.createProgram({
		rootNames: [...matchedFiles],
		options,
		host: typescript.createCompilerHost(options, true)
	});

	program.emit(
		undefined,
		(fileName, data) => {
			const destinationFile = join(cwd, fileName);
			result.files.push({fileName: destinationFile, text: data});

			fileSystem.mkdirSync(dirname(destinationFile), {recursive: true});
			fileSystem.writeFileSync(destinationFile, data);
			logger.info(`${relative(cwd, destinationFile)}`);
		},
		undefined,
		false,
		cjsToEsm()
	);
	return result;
}
