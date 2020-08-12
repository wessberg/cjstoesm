import * as TSModule from "typescript";
import fs from "fs";
import {transformTask} from "../cli/task/transform/transform-task";
import {Logger} from "../shared/logger/logger";
import {LogLevelKind} from "../shared/logger/log-level-kind";
import {TransformResult} from "../type/transform-result";
import {TransformOptions} from "../type/transform-options";

export async function transform({
	fileSystem = fs,
	typescript = TSModule,
	cwd = process.cwd(),
	logger = new Logger(LogLevelKind.NONE),
	input
}: TransformOptions): Promise<TransformResult> {
	return transformTask({
		logger,
		fileSystem,
		cwd,
		typescript,
		input,
		outDir: undefined
	});
}
