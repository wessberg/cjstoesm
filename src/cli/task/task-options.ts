import {FileSystem} from "../file-system/file-system";
import {ILogger} from "../logger/i-logger";
import {TS} from "../../type/type";

export interface TaskOptions {
	root: string;
	logger: ILogger;
	fs: FileSystem;
	typescript: typeof TS;
}
