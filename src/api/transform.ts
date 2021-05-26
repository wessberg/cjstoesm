import {transformTask} from "../cli/task/transform/transform-task";
import {createTransformTaskOptions} from "../shared/task/create-transform-task-options";
import {TransformTaskOptions} from "../shared/task/transform-task-options";
import {TransformResult} from "../shared/task/transform-result";
import {PartialExcept} from "helpertypes";

export async function transform(options: PartialExcept<TransformTaskOptions, "input" | "outDir">): Promise<TransformResult> {
	return transformTask(createTransformTaskOptions(options));
}
