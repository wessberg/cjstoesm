import {TransformTaskOptions} from "../../../shared/task/transform-task-options.js";
import {inspect} from "util";
import fastGlob from "fast-glob";
import {TS} from "../../../type/ts.js";
import {cjsToEsm} from "../../../transformer/cjs-to-esm.js";
import {createCompilerHost} from "../../../shared/compiler-host/create-compiler-host.js";
import {TransformResult} from "../../../shared/task/transform-result.js";
import chalk from "chalk";
import {ensureArray, getFolderClosestToRoot, normalizeGlob} from "../../../shared/util/util.js";
import path from "crosspath";
import {TEMPORARY_SUBFOLDER_NAME} from "../../../shared/constant.js";

/**
 * Executes the 'generate' task
 */
export async function transformTask(options: TransformTaskOptions): Promise<TransformResult> {
	let {logger, input, cwd, outDir, fileSystem, write, typescript, debug, preserveModuleSpecifiers, importAssertions, hooks} = options;

	logger.debug(
		"Options:",
		inspect(
			{input, outDir, cwd, write, debug, preserveModuleSpecifiers, importAssertions},
			{
				colors: true,
				depth: Infinity,
				maxArrayLength: Infinity
			}
		)
	);

	// Match files based on the glob(s)
	const matchedFiles = new Set(
		ensureArray(input).flatMap(glob =>
			fastGlob.sync(normalizeGlob(path.normalize(glob)), {fs: fileSystem}).map(file => (path.isAbsolute(file) ? path.normalize(file) : path.join(cwd, file)))
		)
	);

	logger.debug(`Matched files:`, matchedFiles.size < 1 ? "(none)" : [...matchedFiles].map(f => `"${path.native.normalize(f)}"`).join(", "));

	// Prepare the result object
	const result: TransformResult = {
		files: []
	};

	if (matchedFiles.size < 1) {
		return result;
	}

	const closestFolderToRoot = getFolderClosestToRoot(cwd, matchedFiles);

	// We're going to need an outDir no matter what.
	// If none is given, get the folder closest to the root based on the matched files and use that one.
	if (outDir == null) {
		outDir = path.join(closestFolderToRoot, TEMPORARY_SUBFOLDER_NAME);
	}

	// Prepare CompilerOptions
	const compilerOptions: TS.CompilerOptions = {
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		declaration: false,
		outDir,
		sourceMap: false,
		newLine: typescript.sys.newLine === "\n" ? typescript.NewLineKind.LineFeed : typescript.NewLineKind.CarriageReturnLineFeed,
		rootDir: closestFolderToRoot,
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
			const newFilename = path.normalize(fileName).replace(`/${TEMPORARY_SUBFOLDER_NAME}`, ``);
			const nativeNormalizedFileName = path.native.normalize(newFilename);

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
				fileSystem.mkdirSync(path.native.dirname(nativeNormalizedFileName), {recursive: true});
				fileSystem.writeFileSync(nativeNormalizedFileName, text);
			}
			logger.info(`${chalk.green("✔")} ${path.native.relative(cwd, nativeNormalizedFileName)}`);
		},
		undefined,
		false,
		cjsToEsm(options)
	);
	return result;
}
