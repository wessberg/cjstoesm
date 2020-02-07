import {SourceFile, TransformerFactory} from "typescript";
import {BeforeTransformerOptions} from "./before-transformer-options";
import {transformSourceFile} from "./transform-source-file";

/**
 * @param options
 * @return
 */
export function beforeTransformer(options: BeforeTransformerOptions): TransformerFactory<SourceFile> {
	return context => sourceFile => transformSourceFile(sourceFile, options, context).sourceFile;
}
