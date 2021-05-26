import {TransformTaskOptions} from "../../../shared/task/transform-task-options";
import {inspect} from "util";
import {sync} from "fast-glob";
import {TS} from "../../../type/ts";
import {cjsToEsm} from "../../../transformer/cjs-to-esm";
import {isAbsolute, join, nativeDirname, nativeNormalize, nativeRelative, normalize} from "../../../transformer/util/path-util";
import {createCompilerHost} from "../../../shared/compiler-host/create-compiler-host";
import {TransformResult} from "../../../shared/task/transform-result";
import chalk from "chalk";
import {ensureArray} from "../../../shared/util/util";

/**
 * Executes the 'generate' task
 */
export async function transformTask(options: TransformTaskOptions): Promise<TransformResult> {
	const {logger, input, cwd, outDir, fileSystem, write, typescript, debug, preserveModuleSpecifiers, hooks} = options;

	logger.debug(
		"Options:",
		inspect(
			{input, outDir, cwd, write, debug, preserveModuleSpecifiers},
			{
				colors: true,
				depth: Infinity,
				maxArrayLength: Infinity
			}
		)
	);

	// Match files based on the glob(s)
	const matchedFiles = new Set(ensureArray(input).flatMap(glob => sync(normalize(glob), {fs: fileSystem}).map(file => (isAbsolute(file) ? normalize(file) : join(cwd, file)))));

	logger.debug(`Matched files:`, matchedFiles.size < 1 ? "(none)" : [...matchedFiles].map(f => `"${nativeNormalize(f)}"`).join(", "));

	// Prepare the result object
	const result: TransformResult = {
		files: []
	};

	// Prepare CompilerOptions
	const compilerOptions: TS.CompilerOptions = {
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
		rootNames: [...matchedFiles],
		options: compilerOptions,
		host: createCompilerHost({
			cwd,
			fileSystem,
			typescript
		})
	});

	program.emit(
		undefined,
		(fileName, text) => {
			const nativeNormalizedFileName = nativeNormalize(fileName);

			// If a hook was provided, call it
			if (hooks.writeFile != null) {
				const hookResult = hooks.writeFile(nativeNormalizedFileName, text);
				// If it returned a new value, reassign it to `text`
				if (hookResult != null) {
					text = hookResult;
				}
			}

			result.files.push({fileName: nativeNormalizedFileName, text});

			// Only write files to disk if requested
			if (write) {
				fileSystem.mkdirSync(nativeDirname(nativeNormalizedFileName), {recursive: true});
				fileSystem.writeFileSync(nativeNormalizedFileName, text);
			}
			logger.info(`${chalk.green("✔")} ${nativeRelative(cwd, nativeNormalizedFileName)}`);
		},
		undefined,
		false,
		cjsToEsm(options)
	);
	return result;
}
