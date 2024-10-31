import type {TaskOptions} from "./task-options.js";
import type {FileSystem} from "../file-system/file-system.js";
import type {MaybeArray} from "helpertypes";

export interface TransformHooks {
	/**
	 * If a string is returned from this hoo, that text will be written to disk instead
	 */
	writeFile(file: string, text: string): string | undefined;
}

export interface TransformTaskOptions extends TaskOptions {
	/**
	 * The input glob(s) to match against the file system
	 */
	input: MaybeArray<string>;

	/**
	 * Optionally, the output directory to use. Defaults to inheriting that of the matched input files`
	 */
	outDir?: string;

	/**
	 * If write is false, no files will be written to disk
	 */
	write: boolean;

	/**
	 * The FileSystem to use. Useful if you want to work with a virtual file system. Defaults to using the "fs" module
	 */
	fileSystem: FileSystem;

	/**
	 * A collection of hooks into the transformation process
	 * that can be used for logging or altering the internal behavior
	 */
	hooks: Partial<TransformHooks>;
}
