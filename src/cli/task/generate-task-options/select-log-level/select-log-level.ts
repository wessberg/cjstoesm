import {SelectLogLevelOptions} from "./select-log-level-options";
import {LogLevelKind} from "../../../../shared/logger/log-level-kind";

/**
 * Selects a LogLevel based on the given options
 *
 * @param options
 * @returns
 */
export function selectLogLevel(options: SelectLogLevelOptions): LogLevelKind {
	if (options.debug) {
		return LogLevelKind.DEBUG;
	} else if (options.verbose) {
		return LogLevelKind.VERBOSE;
	} else if (options.silent) {
		return LogLevelKind.NONE;
	} else {
		return LogLevelKind.INFO;
	}
}
