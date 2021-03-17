import {FileSystem} from "../shared/file-system/file-system";
import {Loggable} from "../shared/logger/loggable";
import {CjsToEsmOptions} from "../transformer/cjs-to-esm-options";

export interface TransformOptions extends Pick<CjsToEsmOptions, "preserveModuleSpecifiers"|"typescript"> {
	/**
	 * The input glob to match against the file system
	 */
	input: string;

	/**
	 * The FileSystem to use. Useful if you want to work with a virtual file system. Defaults to using the "fs" module
	 */
	fileSystem?: FileSystem;

	/**
	 * The current working directory to use as the base. Defaults to process.cwd()
	 */
	cwd?: string;

	/**
	 * A custom logger to be provide.
	 */
	logger?: Loggable;
}
