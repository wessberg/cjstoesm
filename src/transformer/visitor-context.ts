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

	/**
	 * The Node Factory for creating and updating nodes in the tree
	 */
	factory: TS.NodeFactory;

	/**
	 * The TypeScript transformation context
	 */
	transformationContext: TS.TransformationContext;

	printer?: TS.Printer;
}
