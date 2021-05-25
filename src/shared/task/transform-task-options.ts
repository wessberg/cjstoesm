import {TaskOptions} from "./task-options";
import {MaybeArray} from "../../type/type-util";
import {FileSystem} from "../file-system/file-system";

export interface TransformHooks {
	/**
	 * If a new Set is returned, that Set of file names
	 * will be used as if the glob(s) matched those
	 */
	matchedFiles(files: Set<string>): Set<string> | undefined;

	/**
	 * If a string is returned from this hoo, that text will be written to disk instead
	 */
	writeFile(file: string, text: string): string | void;
}

export interface TransformTaskOptions extends TaskOptions {
	/**
	 * The input glob(s) to match against the file system
	 */
	input: MaybeArray<string>;

	/**
	 * The output directory to use
	 */
	outDir: string;

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
