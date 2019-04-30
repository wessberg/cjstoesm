import {CjsToEsmOptions} from "./cjs-to-esm-options";
import {Printer} from "typescript";

export interface VisitorContext extends Required<CjsToEsmOptions> {
	onlyExports: boolean;
	printer?: Printer;
}
