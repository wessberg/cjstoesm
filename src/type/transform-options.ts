import {FileSystem} from "../shared/file-system/file-system";
import {TS} from "./ts";
import {Loggable} from "../shared/logger/loggable";

export interface TransformOptions {
	/**
	 * The input glob to match against the file system
	 */
	input: string;

	/**
	 * The FileSystem to use. Useful if you want to work with a virtual file system. Defaults to using the "fs" module
	 */
	fileSystem?: FileSystem;

	/**
	 * The TypeScript module to use.
	 */
	typescript?: typeof TS;

	/**
	 * The current working directory to use as the base. Defaults to process.cwd()
	 */
	cwd?: string;

	/**
	 * A custom logger to be provide.
	 */
	logger?: Loggable;
}
