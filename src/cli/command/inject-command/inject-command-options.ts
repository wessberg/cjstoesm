import type {FileSystem} from "../../../shared/file-system/file-system.js";
import type {TS} from "../../../type/ts.js";
import type {TransformHooks} from "../../../shared/task/transform-task-options.js";
import type {Command} from "commander";

export interface InjectCommandOptions {
	program: Command;
	fileSystem?: FileSystem;
	typescript?: typeof TS;
	hooks?: Partial<TransformHooks>;
}
