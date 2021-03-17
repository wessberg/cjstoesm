import * as TSModule from "typescript";
import {transformTask} from "../cli/task/transform/transform-task";
import {Logger} from "../shared/logger/logger";
import {LogLevelKind} from "../shared/logger/log-level-kind";
import {TransformResult} from "../type/transform-result";
import {TransformOptions} from "../type/transform-options";
import {realFileSystem} from "../shared/file-system/file-system";

export async function transform({
	fileSystem = realFileSystem,
	typescript = TSModule,
	cwd = process.cwd(),
	logger = new Logger(LogLevelKind.NONE),
	input,
	preserveModuleSpecifiers
}: TransformOptions): Promise<TransformResult> {
	return transformTask({
		logger,
		fileSystem,
		cwd,
		typescript,
		input,
		preserveModuleSpecifiers,
		outDir: undefined
	});
}
