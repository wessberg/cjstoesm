import {TransformTaskOptions} from "./transform-task-options";
import {CONSTANT} from "../../constant/constant";
import {inspect} from "util";
import {sync} from "glob";
import {TS} from "../../../type/ts";
import {cjsToEsm} from "../../../transformer/cjs-to-esm";
import {TransformResult} from "../../../type/transform-result";
import {dirname, isAbsolute, nativeJoin, nativeNormalize, nativeRelative, normalize} from "../../../transformer/util/path-util";

/**
 * Executes the 'generate' task
 */
export async function transformTask({logger, input, outDir, cwd, fileSystem, typescript, preserveModuleSpecifiers}: TransformTaskOptions): Promise<TransformResult> {
	if (input == null) {
		throw new ReferenceError(`Missing required argument: 'input'`);
	}

	logger.debug(inspect({input, outDir, cwd}, CONSTANT.inspectOptions));

	// Match files based on the glob
	const matchedFiles = new Set(sync(input).map(file => (isAbsolute(file) ? nativeNormalize(file) : nativeJoin(cwd, file))));
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
		rootDir: cwd,
		moduleResolution: typescript.ModuleResolutionKind.NodeJs
	};

	// Create a TypeScript program based on the glob
	const program = typescript.createProgram({
		rootNames: [...matchedFiles].map(normalize),
		options,
		host: typescript.createCompilerHost(options, true)
	});

	program.emit(
		undefined,
		(fileName, data) => {
			const destinationFile = nativeJoin(cwd, fileName);
			result.files.push({fileName: destinationFile, text: data});

			fileSystem.mkdir(dirname(destinationFile), {recursive: true});
			fileSystem.writeFile(destinationFile, data);
			logger.info(`${nativeRelative(cwd, destinationFile)}`);
		},
		undefined,
		false,
		cjsToEsm({preserveModuleSpecifiers, cwd, fileSystem})
	);
	return result;
}
