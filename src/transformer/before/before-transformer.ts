import {BeforeTransformerOptions} from "./before-transformer-options";
import {transformSourceFile} from "./transform-source-file";
import {TS} from "../../type/type";

/**
 * @param options
 * @return
 */
export function beforeTransformer(options: BeforeTransformerOptions): TS.TransformerFactory<TS.SourceFile> {
	return context => sourceFile => transformSourceFile(sourceFile, options, context).sourceFile;
}
