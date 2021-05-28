import {transformSourceFile} from "./transform-source-file";
import {TS} from "../type/ts";
import {createTaskOptions} from "../shared/task/create-task-options";
import {createSafeFileSystem} from "../shared/file-system/file-system";
import {VisitorContext} from "./visitor-context";
import {ensureNodeFactory} from "compatfactory";
import {CjsToEsmOptions} from "./cjs-to-esm-options";

export function cjsToEsmTransformer(options: Partial<CjsToEsmOptions> = {}): TS.TransformerFactory<TS.SourceFile> {
	return context => {
		const sanitizedOptions = createTaskOptions(options);
		const {fileSystem, typescript} = sanitizedOptions;

		// Prepare a VisitorContext
		const visitorContext: VisitorContext = {
			...sanitizedOptions,
			transformationContext: context,
			factory: ensureNodeFactory(context.factory ?? typescript),
			fileSystem: createSafeFileSystem(fileSystem),
			onlyExports: false,
			resolveCache: new Map(),
			printer: typescript.createPrinter()
		};

		return sourceFile => transformSourceFile(sourceFile, visitorContext).sourceFile;
	};
}
