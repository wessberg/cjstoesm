import {LogLevel} from "./log-level";
import chalk from "chalk";
import {ILogger} from "./i-logger";

/**
 * A logger that can print to the console
 */
export class Logger implements ILogger {
	private readonly INFO_COLOR = "white";
	private readonly VERBOSE_COLOR = "gray";
	private readonly WARNING_COLOR = "yellow";
	private readonly DEBUG_COLOR = "cyan";

	constructor(private readonly logLevel: LogLevel) {}

	/**
	 * Logs info-related messages
	 * @param {string[]} messages
	 */
	public info(...messages: string[]): void {
		if (this.logLevel < LogLevel.INFO) return;
		console.log(chalk[this.INFO_COLOR](...messages));
	}

	/**
	 * Logs verbose-related messages
	 * @param {string[]} messages
	 */
	public verbose(...messages: string[]): void {
		if (this.logLevel < LogLevel.VERBOSE) return;
		console.log(chalk[this.VERBOSE_COLOR](...messages));
	}

	/**
	 * Logs debug-related messages
	 * @param {string[]} messages
	 */
	public debug(...messages: string[]): void {
		if (this.logLevel < LogLevel.DEBUG) return;
		console.log(chalk[this.DEBUG_COLOR](...messages));
	}

	/**
	 * Logs warning-related messages
	 * @param {string[]} messages
	 */
	public warn(...messages: string[]): void {
		console.warn(chalk[this.WARNING_COLOR](`(!)`, ...messages));
	}
}
