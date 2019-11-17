import {join, normalize} from "path";
import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {
	CompilerOptions,
	createProgram,
	createSourceFile,
	getDefaultLibFileName,
	ModuleKind,
	ScriptKind,
	ScriptTarget,
	SourceFile,
	sys
} from "typescript";
import {isInDebugMode} from "../util/is-in-debug-mode";

// tslint:disable:no-any

export interface ITestFile {
	fileName: string;
	text: string;
	entry: boolean;
}

export type TestFile = ITestFile | string;

/**
 * Prepares a test
 * @param {ITestFile[]|TestFile} inputFiles
 * @returns {Promise<{fileName: string, text: string}[]>}
 */
export function generateTransformerResult(inputFiles: TestFile[] | TestFile): {fileName: string; text: string}[] {
	const cwd = process.cwd();

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
		.map(file => ({...file, fileName: join(cwd, file.fileName)}));

	const entryFile = files.find(file => file.entry);
	if (entryFile == null) {
		throw new ReferenceError(`No entry could be found`);
	}

	const outputFiles: {fileName: string; text: string}[] = [];

	const readFile = (fileName: string): string | undefined => {
		const normalized = normalize(fileName);
		const matchedFile = files.find(currentFile => currentFile.fileName === normalized);
		return matchedFile == null ? undefined : matchedFile.text;
	};
	const fileExists = (fileName: string): boolean => {
		const normalized = normalize(fileName);
		return files.some(currentFile => currentFile.fileName === normalized);
	};

	const transformers = cjsToEsm({readFile, fileExists, debug: isInDebugMode()});

	const compilerOptions: CompilerOptions = {
		module: ModuleKind.ESNext,
		target: ScriptTarget.ESNext,
		allowJs: true,
		sourceMap: false
	};

	const program = createProgram({
		rootNames: files.map(file => file.fileName),
		options: compilerOptions,
		host: {
			writeFile: () => {},
			readFile,
			fileExists,
			getSourceFile(fileName: string, languageVersion: ScriptTarget): SourceFile | undefined {
				const normalized = normalize(fileName);
				const sourceText = this.readFile(normalized);
				if (sourceText == null) return undefined;

				return createSourceFile(normalized, sourceText, languageVersion, true, ScriptKind.TS);
			},

			getCurrentDirectory() {
				return ".";
			},

			getDirectories(directoryName: string) {
				const normalized = normalize(directoryName);
				return sys.getDirectories(normalized);
			},

			getDefaultLibFileName(options: CompilerOptions): string {
				return getDefaultLibFileName(options);
			},

			getCanonicalFileName(fileName: string): string {
				return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
			},

			getNewLine(): string {
				return sys.newLine;
			},

			useCaseSensitiveFileNames() {
				return sys.useCaseSensitiveFileNames;
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
