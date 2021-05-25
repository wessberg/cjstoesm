import {TS} from "../type/ts";
import {SafeReadonlyFileSystem} from "../shared/file-system/file-system";
import {TaskOptions} from "../shared/task/task-options";

export interface VisitorContext extends TaskOptions {
	onlyExports: boolean;

	/**
	 * A safe variant of a Readonly FileSystem that doesn't throw errors
	 */
	fileSystem: SafeReadonlyFileSystem;

	/**
	 * A cache that reuses previous lookups for module specifiers to avoid unnecessary duplication of work
	 */
	resolveCache: Map<string, string | null>;
	printer?: TS.Printer;
}
