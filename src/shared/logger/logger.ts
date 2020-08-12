import {LogLevelKind} from "./log-level-kind";
import chalk from "chalk";
import {Loggable} from "./loggable";

/**
 * A logger that can print to the console
 */
export class Logger implements Loggable {
	private readonly INFO_COLOR = "white";
	private readonly VERBOSE_COLOR = "gray";
	private readonly WARNING_COLOR = "yellow";
	private readonly DEBUG_COLOR = "cyan";

	constructor(private readonly logLevel: LogLevelKind) {}

	/**
	 * Logs info-related messages
	 */
	info(...messages: string[]): void {
		if (this.logLevel < LogLevelKind.INFO) return;
		console.log(chalk[this.INFO_COLOR](...messages));
	}

	/**
	 * Logs verbose-related messages
	 */
	verbose(...messages: string[]): void {
		if (this.logLevel < LogLevelKind.VERBOSE) return;
		console.log(chalk[this.VERBOSE_COLOR](...messages));
	}

	/**
	 * Logs debug-related messages
	 */
	debug(...messages: string[]): void {
		if (this.logLevel < LogLevelKind.DEBUG) return;
		console.log(chalk[this.DEBUG_COLOR](...messages));
	}

	/**
	 * Logs warning-related messages
	 */
	warn(...messages: string[]): void {
		console.warn(chalk[this.WARNING_COLOR](`(!)`, ...messages));
	}
}
