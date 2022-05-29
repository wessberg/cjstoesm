import {FileSystem} from "../../../shared/file-system/file-system.js";
import {TS} from "../../../type/ts.js";
import {CliProgram} from "../create-command/create-command-options.js";
import {TransformHooks} from "../../../shared/task/transform-task-options.js";

export interface InjectCommandOptions {
	program: CliProgram;
	fileSystem?: FileSystem;
	typescript?: typeof TS;
	hooks?: Partial<TransformHooks>;
}
