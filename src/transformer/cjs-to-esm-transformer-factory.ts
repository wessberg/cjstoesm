import * as TSModule from "typescript";
import {beforeTransformer} from "./before/before-transformer";
import {VisitorContext} from "./visitor-context";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {existsSync, readFileSync, statSync} from "fs";
import {normalize} from "path";
import {TS} from "../type/ts";

/**
 * A TransformerFactory that converts CommonJS to tree-shakeable ESM
 *
 * @param [options]
 * @returns
 */
export function cjsToEsmTransformerFactory({
	fileExists = file => existsSync(normalize(file)) && !statSync(normalize(file)).isDirectory(),
	readFile = (file: string, encoding?: BufferEncoding) => (existsSync(normalize(file)) ? readFileSync(normalize(file), encoding).toString() : undefined),
	debug = false,
	typescript = TSModule,
	...rest
}: CjsToEsmOptions = {}): TS.TransformerFactory<TS.SourceFile> {
	// Prepare a VisitorContext
	const visitorContext = ((): VisitorContext => ({
		...rest,
		debug,
		typescript,
		fileExists,
		readFile,
		onlyExports: false,
		printer: typescript.createPrinter()
	}))();

	return beforeTransformer({baseVisitorContext: visitorContext});
}
