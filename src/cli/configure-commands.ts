import {Command} from "commander";
import {injectTransformCommand} from "./command/transform/inject-transform-command";
import {InjectCommandOptions} from "./command/inject-command/inject-command-options";

export interface ConfigureCommandsOptions extends Omit<InjectCommandOptions, "program"> {
	commandLoaders: ((options: InjectCommandOptions) => void)[];
	args: string[];
	keepAliveOnError: boolean;
}

export function configureCommands({
	keepAliveOnError = false,
	commandLoaders = [injectTransformCommand],
	args = [...process.argv],
	...injectCommandOptions
}: Partial<ConfigureCommandsOptions> = {}): void {
	const program = new Command();

	if (keepAliveOnError) {
		program.exitOverride();
	}

	for (const commandLoader of commandLoaders) {
		commandLoader({...injectCommandOptions, program});
	}

	if (args[2] !== "transform") {
		args.splice(2, 0, "transform");
	}
	program.parse(args);
}
