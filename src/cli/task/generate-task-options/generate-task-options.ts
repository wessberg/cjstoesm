import {TaskOptions} from "../task-options";
import {SanitizedSharedOptions} from "./sanitized-shared-options";
import {selectLogLevel} from "./select-log-level/select-log-level";
import fs from "fs";
import * as TSModule from "typescript";
import {Logger} from "../../logger/logger";
import {LogLevel} from "../../logger/log-level";

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
	if (logLevel === LogLevel.VERBOSE) {
		logger.verbose(`Logging mode: VERBOSE`);
	} else if (logLevel === LogLevel.DEBUG) logger.debug(`Logging mode: DEBUG`);

	return {
		fs,
		logger,
		root: process.cwd(),
		typescript: TSModule
	};
}
