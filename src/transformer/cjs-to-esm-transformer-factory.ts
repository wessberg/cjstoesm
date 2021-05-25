import {beforeTransformer} from "./before/before-transformer";
import {VisitorContext} from "./visitor-context";
import {TS} from "../type/ts";
import {createSafeFileSystem} from "../shared/file-system/file-system";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {createTaskOptions} from "../shared/task/create-task-options";

/**
 * A TransformerFactory that converts CommonJS to tree-shakeable ESM
 */
export function cjsToEsmTransformerFactory(options: Partial<CjsToEsmOptions> = {}): TS.TransformerFactory<TS.SourceFile> {
	const sanitizedOptions = createTaskOptions(options);
	const {fileSystem, typescript} = sanitizedOptions;

	// Prepare a VisitorContext
	const visitorContext = ((): VisitorContext => ({
		...sanitizedOptions,
		fileSystem: createSafeFileSystem(fileSystem),
		onlyExports: false,
		resolveCache: new Map(),
		printer: typescript.createPrinter()
	}))();

	return beforeTransformer({baseVisitorContext: visitorContext});
}
