import {TS} from "../type/ts";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {cjsToEsmTransformer} from "./cjs-to-esm-transformer";

/**
 * CustomTransformer that converts CommonJS to tree-shakeable ESM
 */
export function cjsToEsm(options?: Partial<CjsToEsmOptions>): TS.CustomTransformers {
	return {
		before: [cjsToEsmTransformer(options)]
	};
}
