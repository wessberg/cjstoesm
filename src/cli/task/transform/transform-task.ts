import {TransformTaskOptions} from "./transform-task-options";
import {CONSTANT} from "../../constant/constant";
import {inspect} from "util";
import {sync} from "glob";
import {CompilerOptions, createPrinter, createProgram, NewLineKind, ScriptTarget, sys} from "typescript";
import {cjsToEsm} from "../../../transformer/cjs-to-esm";
import {dirname, isAbsolute, join, relative} from "path";

/**
 * Executes the 'generate' task
 * @param {TransformTaskOptions} options
 * @returns {Promise<void>}
 */
export async function transformTask({logger, input, outDir, root, fs}: TransformTaskOptions): Promise<void> {
	if (input == null) {
		throw new ReferenceError(`Missing required argument: 'input'`);
	}

	if (outDir == null) {
		throw new ReferenceError(`Missing required argument: 'outDir'`);
	}

	logger.debug(inspect({input, outDir, root}, CONSTANT.INSPECT_OPTIONS));

	// Compute an absolute outDir
	const absoluteOutDir = isAbsolute(outDir) ? outDir : join(root, outDir);

	// Match files based on the glob
	const matchedFiles = new Set(sync(input).map(file => (isAbsolute(file) ? file : join(root, file))));
	logger.debug(`Matched files:`, matchedFiles.size < 1 ? "(none)" : [...matchedFiles].map(f => `"${f}"`).join(", "));

	// Prepare CompilerOptions
	const options: CompilerOptions = {
		target: ScriptTarget.ESNext,
		allowJs: true,
		declaration: false,
		outDir,
		sourceMap: false,
		newLine: sys.newLine === "\n" ? NewLineKind.LineFeed : NewLineKind.CarriageReturnLineFeed
	};

	// Create a printer
	const printer = createPrinter({newLine: options.newLine});

	// Create a TypeScript program based on the glob
	const program = createProgram({
		rootNames: [...matchedFiles],
		options: {
			target: ScriptTarget.ESNext,
			allowJs: true,
			declaration: false,
			outDir,
			sourceMap: false,
			rootDir: root
		}
	});
	program.emit(
		undefined,
		(_fileName, _data) => {
			// Noop
		},
		undefined,
		false,
		cjsToEsm({
			sourceFileHook: async sourceFile => {
				if (!matchedFiles.has(sourceFile.fileName)) return;

				const destinationFile = join(absoluteOutDir, relative(root, sourceFile.fileName));

				if (!fs.existsSync(destinationFile)) {
					fs.mkdirSync(dirname(destinationFile), {recursive: true});
					fs.writeFileSync(destinationFile, printer.printFile(sourceFile));
					logger.info(`${relative(root, sourceFile.fileName)} => ${relative(root, destinationFile)}`);
				}
			}
		})
	);
}
