import {transformTask} from "../cli/task/transform/transform-task";
import {createTransformTaskOptions} from "../shared/task/create-transform-task-options";
import {TransformTaskOptions} from "../shared/task/transform-task-options";
import {PartialExcept} from "../type/type-util";
import {TransformResult} from "../shared/task/transform-result";

export async function transform(options: PartialExcept<TransformTaskOptions, "input" | "outDir">): Promise<TransformResult> {
	return transformTask(createTransformTaskOptions(options));
}
