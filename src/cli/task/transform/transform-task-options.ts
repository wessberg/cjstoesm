import {TaskOptions} from "../task-options";
import {CjsToEsmOptions} from "../../../transformer/cjs-to-esm-options";

export interface TransformTaskOptions extends TaskOptions {
	input: string;
	outDir: string | undefined;
	preserveModuleSpecifiers: CjsToEsmOptions["preserveModuleSpecifiers"];
}
