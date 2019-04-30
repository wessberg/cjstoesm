import {SourceFile, TransformerFactory} from "typescript";
import {BeforeTransformerOptions} from "./before-transformer-options";
import {beforeTransformerSourceFileStep} from "./before-transformer-source-file-step";

/**
 * @param {BeforeTransformerOptions} options
 * @return {TransformerFactory<SourceFile>}
 */
export function beforeTransformer(options: BeforeTransformerOptions): TransformerFactory<SourceFile> {
	return context => sourceFile => beforeTransformerSourceFileStep(sourceFile, options, context).sourceFile;
}
