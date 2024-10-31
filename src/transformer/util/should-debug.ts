import type {TS} from "../../type/ts.js";
import type {TaskOptions} from "../../shared/task/task-options.js";

export function shouldDebug(debug: TaskOptions["debug"] | undefined, sourceFile?: TS.SourceFile): boolean {
	if (debug == null) return false;
	if (typeof debug === "boolean") return debug;
	if (sourceFile == null) return true;
	if (typeof debug === "string") return sourceFile.fileName === debug;
	else return debug(sourceFile.fileName);
}
