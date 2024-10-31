import type {LogLevelKind} from "./log-level-kind.js";

export interface Loggable {
	/**
	 * The current log level
	 */
	readonly logLevel: LogLevelKind;

	/**
	 * Logs info-related messages
	 */
	info(...messages: unknown[]): void;

	/**
	 * Logs verbose-related messages
	 */
	verbose(...messages: unknown[]): void;

	/**
	 * Logs debug-related messages
	 */
	debug(...messages: unknown[]): void;

	/**
	 * Logs warning-related messages
	 */
	warn(...messages: unknown[]): void;
}
