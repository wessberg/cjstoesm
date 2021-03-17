import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {cjsToEsmTransformerFactory} from "./cjs-to-esm-transformer-factory";
import {TS} from "../type/ts";

/**
 * CustomTransformer that converts CommonJS to tree-shakeable ESM
 */
export function cjsToEsm(options: CjsToEsmOptions = {}): TS.CustomTransformers {
	return {
		before: [cjsToEsmTransformerFactory(options)]
	};
}
