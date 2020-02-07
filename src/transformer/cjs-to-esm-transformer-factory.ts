import {createPrinter, SourceFile, TransformerFactory} from "typescript";
import {beforeTransformer} from "./before/before-transformer";
import {VisitorContext} from "./visitor-context";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {existsSync, readFileSync, statSync} from "fs";
import {normalize} from "path";

/**
 * A TransformerFactory that converts CommonJS to tree-shakeable ESM
 *
 * @param [options]
 * @returns
 */
export function cjsToEsmTransformerFactory({
	fileExists = file => existsSync(normalize(file)) && !statSync(normalize(file)).isDirectory(),
	readFile = (file: string, encoding?: string) => (existsSync(normalize(file)) ? readFileSync(normalize(file), encoding).toString() : undefined),
	debug = false,
	...rest
}: CjsToEsmOptions = {}): TransformerFactory<SourceFile> {
	// Prepare a VisitorContext
	const visitorContext = ((): VisitorContext => ({
		...rest,
		debug,
		printer: debug ? createPrinter() : undefined,
		fileExists,
		readFile,
		onlyExports: false
	}))();

	return beforeTransformer({baseVisitorContext: visitorContext});
}
