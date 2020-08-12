import {TaskOptions} from "../task-options";
import {SanitizedSharedOptions} from "./sanitized-shared-options";
import {selectLogLevel} from "./select-log-level/select-log-level";
import fileSystem from "fs";
import * as TSModule from "typescript";
import {Logger} from "../../../shared/logger/logger";
import {LogLevelKind} from "../../../shared/logger/log-level-kind";

/**
 * Generates the task options that are shared across all commands
 *
 * @param options
 * @returns
 */
export async function generateTaskOptions(options: SanitizedSharedOptions): Promise<TaskOptions> {
	// Prepare a logger
	const logLevel = selectLogLevel(options);
	const logger = new Logger(logLevel);

	// Inform about the log level (if applicable)
	if (logLevel === LogLevelKind.VERBOSE) {
		logger.verbose(`Logging mode: VERBOSE`);
	} else if (logLevel === LogLevelKind.DEBUG) logger.debug(`Logging mode: DEBUG`);

	return {
		fileSystem,
		logger,
		cwd: process.cwd(),
		typescript: TSModule
	};
}
