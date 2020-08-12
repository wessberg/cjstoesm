import {createCommand} from "../create-command/create-command";
import {TRANSFORM_COMMAND_OPTIONS} from "./transform-command-options";
import {generateTaskOptions} from "../../task/generate-task-options/generate-task-options";
import {SHARED_OPTIONS} from "../shared/shared-options";

createCommand(
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
				required: true,
				description: `The directory to write the transformed files to.`
			}
		},
		options: {
			...SHARED_OPTIONS,
			...TRANSFORM_COMMAND_OPTIONS
		}
	},
	async args => {
		// Load the task
		const {transformTask} = await import("../../task/transform/transform-task");
		const taskOptions = await generateTaskOptions(args);

		if (args.outDir == null) {
			throw new ReferenceError(`Missing required argument: 'outDir'`);
		}

		// Execute it
		await transformTask({
			...taskOptions,
			input: args.input,
			outDir: args.outDir
		});
	}
);
