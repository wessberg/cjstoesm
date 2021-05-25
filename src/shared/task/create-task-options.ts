import {TaskOptions} from "./task-options";
import {realReadonlyFileSystem} from "../file-system/file-system";
import {Logger} from "../logger/logger";
import {LogLevelKind} from "../logger/log-level-kind";
import {TS} from "../../type/ts";

export function createTaskOptions({
	typescript = TS,
	fileSystem = realReadonlyFileSystem,
	debug = false,
	cwd = process.cwd(),
	preserveModuleSpecifiers = "external",
	logger = new Logger(debug !== false ? LogLevelKind.DEBUG : LogLevelKind.NONE)
}: Partial<TaskOptions> = {}): TaskOptions {
	return {
		typescript,
		fileSystem,
		debug,
		cwd,
		preserveModuleSpecifiers,
		logger
	};
}
