import {createPrinter, SourceFile, TransformerFactory} from "typescript";
import {beforeTransformer} from "./before/before-transformer";
import {VisitorContext} from "./visitor-context";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {existsSync, readFileSync, statSync} from "fs";

/**
 * A TransformerFactory that converts CommonJS to tree-shakeable ESM
 * @param {CjsToEsmOptions} [options]
 * @returns {TransformerFactory<SourceFile>}
 */
export function cjsToEsmTransformerFactory({
	fileExists = file => existsSync(file) && !statSync(file).isDirectory(),
	readFile = (file: string, encoding?: string) => (existsSync(file) ? readFileSync(file, encoding).toString() : undefined),
	debug = false,
	...rest
}: CjsToEsmOptions = {}): TransformerFactory<SourceFile> {
	// Prepare a VisitorContext
	const visitorContext = ((): VisitorContext => {
		return {
			...rest,
			debug,
			printer: debug ? createPrinter() : undefined,
			fileExists,
			readFile,
			onlyExports: false
		};
	})();

	return beforeTransformer({baseVisitorContext: visitorContext});
}
