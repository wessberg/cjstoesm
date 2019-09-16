import {ResolveOptions} from "./util/resolve-path";
import {SourceFile} from "typescript";

export interface CjsToEsmOptions {
	debug?: boolean;
	readFile?: ResolveOptions["readFile"];
	fileExists?: ResolveOptions["fileExists"];
	sourceFileHook?(sourceFile: SourceFile): void;
}
