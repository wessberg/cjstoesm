import {createCommand} from "../create-command/create-command.js";
import {InjectCommandOptions} from "../inject-command/inject-command-options.js";
import {LogLevelKind} from "../../../shared/logger/log-level-kind.js";
import {Logger} from "../../../shared/logger/logger.js";
import {createTransformTaskOptions} from "../../../shared/task/create-transform-task-options.js";
import {transformTask} from "../../task/transform/transform-task.js";

export function injectTransformCommand(options: InjectCommandOptions): void {
	createCommand(
		options.program,
		{
			name: "transform",
			description: `Transforms CJS to ESM modules based on the input glob`,
			isDefault: true,
			args: {
				input: {
					type: "string",
					required: true,
					description: "A glob for all the files that should be transformed"
				},
				outDir: {
					type: "string",
					required: false,
					description: `Optionally, the directory to write the transformed files to. Defaults to overwriting the matched input files`
				}
			},
			options: {
				debug: {
					shortHand: "d",
					type: "boolean",
					description: "Whether to print debug information"
				},
				verbose: {
					shortHand: "v",
					type: "boolean",
					description: "Whether to print verbose information"
				},
				silent: {
					shortHand: "s",
					type: "boolean",
					description: "Whether to not print anything"
				},
				cwd: {
					shortHand: "c",
					type: "string",
					description: `Optionally which directory to use as the current working directory`
				},
				"preserve-module-specifiers": {
					shortHand: "p",
					type: "string",
					defaultValue: "external",
					description: `Determines whether or not module specifiers are preserved. Possible values are: "external", "internal", "always", and "never"`
				},
				dry: {
					shortHand: "m",
					type: "boolean",
					description: "If true, no files will be written to disk"
				}
			}
		},
		async args => {
			const logger = new Logger(args.debug ? LogLevelKind.DEBUG : args.verbose ? LogLevelKind.VERBOSE : args.silent ? LogLevelKind.NONE : LogLevelKind.INFO);

			// Inform about the log level (if applicable)
			if (logger.logLevel === LogLevelKind.VERBOSE) {
				logger.verbose(`Logging mode: VERBOSE`);
			} else if (logger.logLevel === LogLevelKind.DEBUG) {
				logger.debug(`Logging mode: DEBUG`);
			}

			const taskOptions = createTransformTaskOptions({
				...options,
				...args,
				logger,
				write: !args.dry
			});

			// Execute it
			await transformTask(taskOptions);
		}
	);
}
