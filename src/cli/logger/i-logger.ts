export interface ILogger {
	/**
	 * Logs info-related messages
	 * @param {string[]} messages
	 */
	info(...messages: string[]): void;

	/**
	 * Logs verbose-related messages
	 * @param {string[]} messages
	 */
	verbose(...messages: string[]): void;

	/**
	 * Logs debug-related messages
	 * @param {string[]} messages
	 */
	debug(...messages: string[]): void;

	/**
	 * Logs warning-related messages
	 * @param {string[]} messages
	 */
	warn(...messages: string[]): void;
}
