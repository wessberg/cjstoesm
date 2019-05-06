import {SourceFile, TransformerFactory} from "typescript";
import {BeforeTransformerOptions} from "./before-transformer-options";
import {transformSourceFile} from "./transform-source-file";

/**
 * @param {BeforeTransformerOptions} options
 * @return {TransformerFactory<SourceFile>}
 */
export function beforeTransformer(options: BeforeTransformerOptions): TransformerFactory<SourceFile> {
	return context => sourceFile => transformSourceFile(sourceFile, options, context).sourceFile;
}
