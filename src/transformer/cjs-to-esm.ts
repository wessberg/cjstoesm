import {CustomTransformers} from "typescript";
import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {cjsToEsmTransformerFactory} from "./cjs-to-esm-transformer-factory";

/**
 * CustomTransformer that converts CommonJS to tree-shakeable ESM
 *
 * @param [options]
 * @returns
 */
export function cjsToEsm(options: CjsToEsmOptions = {}): CustomTransformers {
	return {
		before: [cjsToEsmTransformerFactory(options)]
	};
}
