import {TaskOptions} from "../task-options";

export interface TransformTaskOptions extends TaskOptions {
	input: string;
	outDir: string | undefined;
}
