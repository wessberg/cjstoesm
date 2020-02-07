import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {cjsToEsmTransformerFactory} from "./cjs-to-esm-transformer-factory";
import {TS} from "../type/type";

/**
 * CustomTransformer that converts CommonJS to tree-shakeable ESM
 *
 * @param [options]
 * @returns
 */
export function cjsToEsm(options: CjsToEsmOptions = {}): TS.CustomTransformers {
	return {
		before: [cjsToEsmTransformerFactory(options)]
	};
}
