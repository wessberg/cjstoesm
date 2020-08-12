import {CjsToEsmOptions} from "../cjs-to-esm-options";
import {TS} from "../../type/ts";

export function shouldDebug(debug: CjsToEsmOptions["debug"], sourceFile?: TS.SourceFile): boolean {
	if (debug == null) return false;
	if (typeof debug === "boolean") return debug;
	if (sourceFile == null) return true;
	if (typeof debug === "string") return sourceFile.fileName === debug;
	else return debug(sourceFile.fileName);
}
