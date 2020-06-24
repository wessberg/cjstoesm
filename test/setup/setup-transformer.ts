import {join, normalize} from "path";
import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {isInDebugMode} from "../util/is-in-debug-mode";
import {TS} from "../../src/type/type";
import * as typescript from "typescript";
import {CjsToEsmOptions} from "../../src/transformer/cjs-to-esm-options";

// tslint:disable:no-any

export interface ITestFile {
	fileName: string;
	text: string;
	entry: boolean;
}

export type TestFile = ITestFile | string;

/**
 * Prepares a test
 */
export function generateTransformerResult(inputFiles: TestFile[] | TestFile, debug: CjsToEsmOptions["debug"] = isInDebugMode()): {fileName: string; text: string}[] {
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

	const transformers = cjsToEsm({readFile, fileExists, debug});

	const compilerOptions: TS.CompilerOptions = {
		module: typescript.ModuleKind.ESNext,
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		sourceMap: false
	};

	const program = typescript.createProgram({
		rootNames: files.map(file => file.fileName),
		options: compilerOptions,
		host: {
			writeFile: () => {
				// This is a noop
			},
			readFile,
			fileExists,
			getSourceFile(fileName: string, languageVersion: TS.ScriptTarget): TS.SourceFile | undefined {
				const normalized = normalize(fileName);
				const sourceText = this.readFile(normalized);
				if (sourceText == null) return undefined;

				return typescript.createSourceFile(normalized, sourceText, languageVersion, true, typescript.ScriptKind.TS);
			},

			getCurrentDirectory() {
				return ".";
			},

			getDirectories(directoryName: string) {
				const normalized = normalize(directoryName);
				return typescript.sys.getDirectories(normalized);
			},

			getDefaultLibFileName(options: TS.CompilerOptions): string {
				return typescript.getDefaultLibFileName(options);
			},

			getCanonicalFileName(fileName: string): string {
				return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
			},

			getNewLine(): string {
				return typescript.sys.newLine;
			},

			useCaseSensitiveFileNames() {
				return typescript.sys.useCaseSensitiveFileNames;
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
