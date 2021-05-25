import {FileSystem} from "../../../shared/file-system/file-system";
import {TS} from "../../../type/ts";
import {CliProgram} from "../create-command/create-command-options";
import {TransformHooks} from "../../../shared/task/transform-task-options";

export interface InjectCommandOptions {
	program: CliProgram;
	fileSystem?: FileSystem;
	typescript?: typeof TS;
	hooks?: Partial<TransformHooks>;
}
