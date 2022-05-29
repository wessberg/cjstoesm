import {TS} from "../type/ts.js";
import {CjsToEsmOptions} from "./cjs-to-esm-options.js";
import {cjsToEsmTransformer} from "./cjs-to-esm-transformer.js";

/**
 * CustomTransformer that converts CommonJS to tree-shakeable ESM
 */
export function cjsToEsm(options?: Partial<CjsToEsmOptions>): TS.CustomTransformers {
	return {
		before: [cjsToEsmTransformer(options)]
	};
}
