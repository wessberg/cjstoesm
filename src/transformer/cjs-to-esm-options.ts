import {ResolveOptions} from "./util/resolve-path";
import {TS} from "../type/type";

export interface CjsToEsmOptions {
	typescript?: typeof TS;
	debug?: boolean;
	readFile?: ResolveOptions["readFile"];
	fileExists?: ResolveOptions["fileExists"];
}
