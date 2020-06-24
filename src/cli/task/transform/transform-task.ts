import {TransformTaskOptions} from "./transform-task-options";
import {CONSTANT} from "../../constant/constant";
import {inspect} from "util";
import {sync} from "glob";
import {dirname, isAbsolute, join, relative} from "path";
import {TS} from "../../../type/type";
import {cjsToEsm} from "../../../transformer/cjs-to-esm";

/**
 * Executes the 'generate' task
 */
export async function transformTask({logger, input, outDir, root, fs, typescript}: TransformTaskOptions): Promise<void> {
	if (input == null) {
		throw new ReferenceError(`Missing required argument: 'input'`);
	}

	if (outDir == null) {
		throw new ReferenceError(`Missing required argument: 'outDir'`);
	}

	logger.debug(inspect({input, outDir, root}, CONSTANT.inspectOptions));

	// Match files based on the glob
	const matchedFiles = new Set(sync(input).map(file => (isAbsolute(file) ? file : join(root, file))));
	logger.debug(`Matched files:`, matchedFiles.size < 1 ? "(none)" : [...matchedFiles].map(f => `"${f}"`).join(", "));

	// Prepare CompilerOptions
	const options: TS.CompilerOptions = {
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		declaration: false,
		outDir,
		sourceMap: false,
		newLine: typescript.sys.newLine === "\n" ? typescript.NewLineKind.LineFeed : typescript.NewLineKind.CarriageReturnLineFeed,
		rootDir: root
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
			const destinationFile = join(root, fileName);

			fs.mkdirSync(dirname(destinationFile), {recursive: true});
			fs.writeFileSync(destinationFile, data);
			logger.info(`${relative(root, destinationFile)}`);
		},
		undefined,
		false,
		cjsToEsm()
	);
}
