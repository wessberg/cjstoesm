import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {TS} from "../type/ts";

export interface VisitorContext extends Required<CjsToEsmOptions> {
	onlyExports: boolean;

	/**
	 * A cache that reuses previous lookups for module specifiers to avoid unnecessary duplication of work
	 */
	resolveCache: Map<string, string|null>;
	printer?: TS.Printer;
}
