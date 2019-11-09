import {TransformTaskOptions} from "./transform-task-options";
import {CONSTANT} from "../../constant/constant";
import {inspect} from "util";
import {sync} from "glob";
import {
	CompilerOptions,
	createCompilerHost,
	createEmptyStatement,
	createPrinter,
	createProgram,
	NewLineKind,
	ScriptTarget,
	sys,
	TransformationContext
} from "typescript";
import {dirname, isAbsolute, join, relative} from "path";
import {cjsToEsmTransformerFactory} from "../../../transformer/cjs-to-esm-transformer-factory";

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
		newLine: sys.newLine === "\n" ? NewLineKind.LineFeed : NewLineKind.CarriageReturnLineFeed,
		rootDir: root
	};

	// Create a printer
	const printer = createPrinter({newLine: options.newLine});

	// Create a TypeScript program based on the glob
	const program = createProgram({
		rootNames: [...matchedFiles],
		options,
		host: createCompilerHost(options, true)
	});

	// Prepare a noop TransformationContext
	const context: TransformationContext = {
		enableEmitNotification: () => {},
		endLexicalEnvironment: () => [],
		enableSubstitution: () => {},
		getCompilerOptions: () => options,
		startLexicalEnvironment: () => {},
		hoistFunctionDeclaration: () => {},
		hoistVariableDeclaration: () => {},
		isEmitNotificationEnabled: () => false,
		isSubstitutionEnabled: () => false,
		onEmitNode: () => {},
		onSubstituteNode: () => createEmptyStatement(),
		readEmitHelpers: () => [],
		requestEmitHelper: () => {},
		resumeLexicalEnvironment: () => {},
		suspendLexicalEnvironment: () => {}
	};

	const transformer = cjsToEsmTransformerFactory()(context);

	for (const sourceFile of program.getSourceFiles()) {
		if (!matchedFiles.has(sourceFile.fileName)) continue;
		const transformedSourceFile = transformer(sourceFile);

		const destinationFile = join(absoluteOutDir, relative(root, transformedSourceFile.fileName));

		fs.mkdirSync(dirname(destinationFile), {recursive: true});
		fs.writeFileSync(destinationFile, printer.printFile(transformedSourceFile));
		logger.info(`${relative(root, transformedSourceFile.fileName)} => ${relative(root, destinationFile)}`);
	}
}
