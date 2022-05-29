import {TaskOptions} from "./task-options.js";
import {realReadonlyFileSystem} from "../file-system/file-system.js";
import {Logger} from "../logger/logger.js";
import {LogLevelKind} from "../logger/log-level-kind.js";
import ts from "typescript";

export function createTaskOptions({
	typescript = ts,
	fileSystem = realReadonlyFileSystem,
	debug = false,
	cwd = process.cwd(),
	preserveModuleSpecifiers = "external",
	importAssertions = true,
	logger = new Logger(debug !== false ? LogLevelKind.DEBUG : LogLevelKind.NONE)
}: Partial<TaskOptions> = {}): TaskOptions {
	return {
		typescript,
		fileSystem,
		debug,
		cwd,
		preserveModuleSpecifiers,
		importAssertions,
		logger
	};
}
