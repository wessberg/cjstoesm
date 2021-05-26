import {FileSystem} from "../file-system/file-system";
import {TS} from "../../type/ts";
import path from "crosspath";

export interface CreateCompilerHostOptions {
	cwd: string;
	fileSystem: FileSystem;
	typescript: typeof TS;
}

export function createCompilerHost({cwd, fileSystem, typescript}: CreateCompilerHostOptions): TS.CompilerHost {
	return {
		readFile(fileName: string): string | undefined {
			try {
				return fileSystem.readFileSync(fileName).toString();
			} catch {
				return undefined;
			}
		},
		directoryExists(directoryName: string): boolean {
			try {
				return fileSystem.statSync(directoryName).isDirectory();
			} catch {
				return false;
			}
		},
		fileExists(directoryName: string): boolean {
			try {
				return fileSystem.statSync(directoryName).isFile();
			} catch {
				return false;
			}
		},

		writeFile: () => {
			// This is a noop
		},

		getSourceFile(fileName: string, languageVersion: TS.ScriptTarget): TS.SourceFile | undefined {
			const normalized = path.normalize(fileName);
			const sourceText = this.readFile(fileName);

			if (sourceText == null) return undefined;

			return typescript.createSourceFile(normalized, sourceText, languageVersion, true, getScriptKindFromPath(normalized, typescript));
		},

		getCurrentDirectory() {
			return path.native.normalize(cwd);
		},

		getDirectories(directoryName: string) {
			return typescript.sys.getDirectories(directoryName).map(path.native.normalize);
		},

		getDefaultLibFileName(compilerOpts: TS.CompilerOptions): string {
			return typescript.getDefaultLibFileName(compilerOpts);
		},

		getCanonicalFileName(fileName: string): string {
			return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
		},

		getNewLine(): string {
			return typescript.sys.newLine;
		},

		useCaseSensitiveFileNames() {
			return typescript.sys.useCaseSensitiveFileNames;
		},

		realpath(p: string): string {
			return path.native.normalize(p);
		}
	};
}

/**
 * Gets a ScriptKind from the given path
 */
const getScriptKindFromPath = (p: string, typescript: typeof TS): TS.ScriptKind => {
	if (p.endsWith(".js")) {
		return typescript.ScriptKind.JS;
	} else if (p.endsWith(".ts")) {
		return typescript.ScriptKind.TS;
	} else if (p.endsWith(".tsx")) {
		return typescript.ScriptKind.TSX;
	} else if (p.endsWith(".jsx")) {
		return typescript.ScriptKind.JSX;
	} else if (p.endsWith(".json")) {
		return typescript.ScriptKind.JSON;
	} else {
		return typescript.ScriptKind.Unknown;
	}
};
