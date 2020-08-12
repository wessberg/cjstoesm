import {FileSystem} from "../../shared/file-system/file-system";
import {Loggable} from "../../shared/logger/loggable";
import {TS} from "../../type/ts";

export interface TaskOptions {
	cwd: string;
	logger: Loggable;
	fileSystem: FileSystem;
	typescript: typeof TS;
}
