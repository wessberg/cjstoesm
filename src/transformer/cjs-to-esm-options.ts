import {ResolveOptions} from "./util/resolve-path";

export interface CjsToEsmOptions {
	debug?: boolean;
	readFile?: ResolveOptions["readFile"];
	fileExists?: ResolveOptions["fileExists"];
}
