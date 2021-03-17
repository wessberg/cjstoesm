import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {isInDebugMode} from "../util/is-in-debug-mode";
import {TS} from "../../src/type/ts";
import * as TSModule from "typescript";
import {CjsToEsmOptions} from "../../src/transformer/cjs-to-esm-options";
import {nativeDirname, nativeJoin, nativeNormalize, normalize, join} from "../../src/transformer/util/path-util";
import {ReadonlyFileSystem} from "../../src/shared/file-system/file-system";

// tslint:disable:no-any

export interface ITestFile {
	fileName: string;
	text: string;
	entry: boolean;
}

export type TestFile = ITestFile|string;

export interface GenerateTransformerResultOptions {
	preserveModuleSpecifiers: CjsToEsmOptions["preserveModuleSpecifiers"];
	debug: CjsToEsmOptions["debug"];
	typescript: typeof TS;
	cwd: string;
}

const VIRTUAL_ROOT = "#root";
const VIRTUAL_SRC = "src";
const VIRTUAL_DIST = "dist";

/**
 * Prepares a test
 */
export function generateTransformerResult (
	inputFiles: TestFile[]|TestFile,
	{debug = isInDebugMode(), typescript = TSModule, cwd = join(process.cwd(), VIRTUAL_ROOT), preserveModuleSpecifiers = "always"}: Partial<GenerateTransformerResultOptions> = {}
): { fileName: string; text: string }[] {
	const files: ITestFile[] = (Array.isArray(inputFiles) ? inputFiles : [inputFiles])
		.map(file =>
			typeof file === "string"
				? {
					text: file,
					fileName: `auto-generated-${Math.floor(Math.random() * 100000)}.ts`,
					entry: true
				}
				: file
		)
		.map(file => ({...file, fileName: nativeJoin(cwd, VIRTUAL_SRC, file.fileName)}));

	const entryFile = files.find(file => file.entry);
	if (entryFile == null) {
		throw new ReferenceError(`No entry could be found`);
	}

	const outputFiles: { fileName: string; text: string }[] = [];

	const fileSystem: ReadonlyFileSystem = {
		readFile: (fileName: string): string|undefined => {
			const normalized = nativeNormalize(fileName);
			const matchedFile = files.find(currentFile => nativeNormalize(currentFile.fileName) === normalized);

			return matchedFile == null ? undefined : matchedFile.text;
		},
		fileExists: (fileName: string): boolean => {
			const normalized = nativeNormalize(fileName);
			return files.some(currentFile => currentFile.fileName === normalized);
		},

		directoryExists: (dirName: string): boolean => {
			const normalized = nativeNormalize(dirName);
			return files.some(file => nativeDirname(file.fileName) === normalized || nativeDirname(file.fileName).startsWith(nativeNormalize(`${normalized}/`))) || typescript.sys.directoryExists(dirName);
		},
	}

	/**
	 * Gets a ScriptKind from the given path
	 */
	const getScriptKindFromPath = (path: string): TS.ScriptKind => {
		if (path.endsWith(".js")) {
			return typescript.ScriptKind.JS;
		} else if (path.endsWith(".ts")) {
			return typescript.ScriptKind.TS;
		} else if (path.endsWith(".tsx")) {
			return typescript.ScriptKind.TSX;
		} else if (path.endsWith(".jsx")) {
			return typescript.ScriptKind.JSX;
		} else if (path.endsWith(".json")) {
			return typescript.ScriptKind.JSON;
		} else {
			return typescript.ScriptKind.Unknown;
		}
	};

	const transformers = cjsToEsm({fileSystem, debug, typescript, preserveModuleSpecifiers, cwd});

	const compilerOptions: TS.CompilerOptions = {
		module: typescript.ModuleKind.ESNext,
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		sourceMap: false,
		outDir: join(cwd, VIRTUAL_DIST),
		rootDir: normalize(cwd),
		moduleResolution: typescript.ModuleResolutionKind.NodeJs
	};

	const program = typescript.createProgram({
		rootNames: files.map(file => normalize(file.fileName)),
		options: compilerOptions,
		host: {
			...fileSystem,
			writeFile: () => {
				// This is a noop
			},

			getSourceFile (fileName: string, languageVersion: TS.ScriptTarget): TS.SourceFile|undefined {
				const normalized = normalize(fileName);
				const sourceText = this.readFile(fileName);

				if (sourceText == null) return undefined;

				return typescript.createSourceFile(normalized, sourceText, languageVersion, true, getScriptKindFromPath(normalized));
			},

			getCurrentDirectory () {
				return nativeNormalize(cwd);
			},

			getDirectories (directoryName: string) {
				return typescript.sys.getDirectories(directoryName).map(nativeNormalize);
			},

			getDefaultLibFileName (options: TS.CompilerOptions): string {
				return typescript.getDefaultLibFileName(options);
			},

			getCanonicalFileName (fileName: string): string {
				return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
			},

			getNewLine (): string {
				return typescript.sys.newLine;
			},

			useCaseSensitiveFileNames () {
				return typescript.sys.useCaseSensitiveFileNames;
			},

			realpath (path: string): string {
				return nativeNormalize(path);
			}
		}
	});

	program.emit(
		undefined,
		(fileName, text) => {
			outputFiles.push({fileName, text});
		},
		undefined,
		undefined,
		transformers
	);

	return outputFiles;
}
