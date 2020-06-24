import {FileSystem} from "../file-system/file-system";
import {Loggable} from "../logger/loggable";
import {TS} from "../../type/type";

export interface TaskOptions {
	root: string;
	logger: Loggable;
	fs: FileSystem;
	typescript: typeof TS;
}
