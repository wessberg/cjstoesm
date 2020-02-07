import {SelectLogLevelOptions} from "./select-log-level-options";
import {LogLevel} from "../../../logger/log-level";

/**
 * Selects a LogLevel based on the given options
 *
 * @param options
 * @returns
 */
export function selectLogLevel(options: SelectLogLevelOptions): LogLevel {
	if (options.debug) {
		return LogLevel.DEBUG;
	} else if (options.verbose) {
		return LogLevel.VERBOSE;
	} else if (options.silent) {
		return LogLevel.NONE;
	} else {
		return LogLevel.INFO;
	}
}
