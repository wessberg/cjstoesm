import {LogLevelKind} from "./log-level-kind.js";
import color from "ansi-colors";
import type {Loggable} from "./loggable.js";

/**
 * A logger that can print to the console
 */
export class Logger implements Loggable {
	private readonly VERBOSE_COLOR = "cyan";
	private readonly WARNING_COLOR = "yellow";
	private readonly DEBUG_COLOR = "magenta";

	constructor(readonly logLevel: LogLevelKind) {}

	/**
	 * Logs info-related messages
	 */
	info(...messages: unknown[]): void {
		if (this.logLevel < LogLevelKind.INFO) return;
		console.log(...messages);
	}

	/**
	 * Logs verbose-related messages
	 */
	verbose(...messages: unknown[]): void {
		if (this.logLevel < LogLevelKind.VERBOSE) return;
		console.log(color[this.VERBOSE_COLOR]("[VERBOSE]"), ...messages);
	}

	/**
	 * Logs debug-related messages
	 */
	debug(...messages: unknown[]): void {
		if (this.logLevel < LogLevelKind.DEBUG) return;
		console.log(color[this.DEBUG_COLOR]("[DEBUG]"), ...messages);
	}

	/**
	 * Logs warning-related messages
	 */
	warn(...messages: unknown[]): void {
		console.log(color[this.WARNING_COLOR](`(!)`), ...messages);
	}
}
