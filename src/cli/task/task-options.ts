import {FileSystem} from "../file-system/file-system";
import {ILogger} from "../logger/i-logger";

export interface TaskOptions {
	root: string;
	logger: ILogger;
	fs: FileSystem;
}
