import {cjsToEsmTransformerFactory} from "./cjs-to-esm-transformer-factory";
import {TS} from "../type/ts";
import {CjsToEsmOptions} from "./cjs-to-esm-options";

/**
 * CustomTransformer that converts CommonJS to tree-shakeable ESM
 */
export function cjsToEsm(options?: Partial<CjsToEsmOptions>): TS.CustomTransformers {
	return {
		before: [cjsToEsmTransformerFactory(options)]
	};
}
