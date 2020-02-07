import {TransformTaskOptions} from "./transform-task-options";
import {CONSTANT} from "../../constant/constant";
import {inspect} from "util";
import {sync} from "glob";
import {normalize, dirname, isAbsolute, join, relative} from "path";
import {cjsToEsmTransformerFactory} from "../../../transformer/cjs-to-esm-transformer-factory";
import {TS} from "../../../type/type";

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

	logger.debug(inspect({input, outDir, root}, CONSTANT.INSPECT_OPTIONS));

	// Compute an absolute outDir
	const absoluteOutDir = isAbsolute(outDir) ? outDir : join(root, outDir);

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

	// Create a printer
	const printer = typescript.createPrinter({newLine: options.newLine});

	// Create a TypeScript program based on the glob
	const program = typescript.createProgram({
		rootNames: [...matchedFiles],
		options,
		host: typescript.createCompilerHost(options, true)
	});

	// Prepare a noop TransformationContext
	const context: TS.TransformationContext = {
		enableEmitNotification: () => {
			// This is OK
		},
		endLexicalEnvironment: () => [],
		enableSubstitution: () => {
			// This is OK
		},
		getCompilerOptions: () => options,
		startLexicalEnvironment: () => {
			// This is OK
		},
		hoistFunctionDeclaration: () => {
			// This is OK
		},
		hoistVariableDeclaration: () => {
			// This is OK
		},
		isEmitNotificationEnabled: () => false,
		isSubstitutionEnabled: () => false,
		onEmitNode: () => {
			// This is OK
		},
		onSubstituteNode: () => typescript.createEmptyStatement(),
		readEmitHelpers: () => [],
		requestEmitHelper: () => {
			// This is OK
		},
		resumeLexicalEnvironment: () => {
			// This is OK
		},
		suspendLexicalEnvironment: () => {
			// This is OK
		}
	};

	const transformer = cjsToEsmTransformerFactory()(context);

	for (const sourceFile of program.getSourceFiles()) {
		if (!matchedFiles.has(normalize(sourceFile.fileName))) continue;
		const transformedSourceFile = transformer(sourceFile);

		const destinationFile = join(absoluteOutDir, relative(root, normalize(transformedSourceFile.fileName)));

		fs.mkdirSync(dirname(destinationFile), {recursive: true});
		fs.writeFileSync(destinationFile, printer.printFile(transformedSourceFile));
		logger.info(`${relative(root, normalize(transformedSourceFile.fileName))} => ${relative(root, destinationFile)}`);
	}
}
