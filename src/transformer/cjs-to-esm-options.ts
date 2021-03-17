import {TS} from "../type/ts";
import {ReadonlyFileSystem} from "../shared/file-system/file-system";

export interface CjsToEsmOptions {

	/**
	 * If given, a specific TypeScript version to use
	 */
	typescript?: typeof TS;

	/**
	 * If true, debug information will be printed. If a function is provided, it will be invoked for each file name. Returning true from the function
	 * determines that debug information will be printed related to that file
	 */
	debug?: boolean | string | ((file: string) => boolean);

	/**
	 * Determines how module specifiers are treated.
	 * - external (default): CommonJS module specifiers identifying libraries or built-in modules are preserved (default)
	 * - internal: CommonJS module specifiers identifying anything else than libraries or built-in modules are preserved
	 * - always: CommonJS module specifiers are never transformed.
	 * - never: CommonJS module specifiers are always transformed
	 * It can also take a function that is invoked with a module specifier and returns a boolean determining whether or not it should be preserved
	 */
	preserveModuleSpecifiers?: "always"|"never"|"external"|"internal"|((specifier: string) => boolean);

	/**
	 * Optionally the file system to use.
	 */
	fileSystem?: ReadonlyFileSystem;

	/**
	 * The base directory (defaults to process.cwd())
	 */
	cwd?: string;
}
