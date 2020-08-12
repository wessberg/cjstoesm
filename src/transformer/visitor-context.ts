import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {TS} from "../type/ts";

export interface VisitorContext extends Required<CjsToEsmOptions> {
	onlyExports: boolean;
	printer?: TS.Printer;
}
