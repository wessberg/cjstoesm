import * as TSModule from "typescript";
import {beforeTransformer} from "./before/before-transformer";
import {VisitorContext} from "./visitor-context";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {TS} from "../type/ts";
import {realReadonlyFileSystem} from "../shared/file-system/file-system";

/**
 * A TransformerFactory that converts CommonJS to tree-shakeable ESM
 */
export function cjsToEsmTransformerFactory({
	fileSystem = realReadonlyFileSystem,
	debug = false,
	cwd = process.cwd(),
	preserveModuleSpecifiers = "external",
	typescript = TSModule,
	...rest
}: CjsToEsmOptions = {}): TS.TransformerFactory<TS.SourceFile> {
	// Prepare a VisitorContext
	const visitorContext = ((): VisitorContext => ({
		...rest,
		debug,
		preserveModuleSpecifiers,
		typescript,
		fileSystem,
		cwd,
		onlyExports: false,
		resolveCache: new Map(),
		printer: typescript.createPrinter()
	}))();

	return beforeTransformer({baseVisitorContext: visitorContext});
}
