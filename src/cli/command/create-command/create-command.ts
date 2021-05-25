import {CliProgram, CommandAction, CommandActionOptions, CommandOptionType, CreateCommandOptions} from "./create-command-options";

// tslint:disable:no-any

/**
 * Coerces the given option value into an acceptable data type
 */
function coerceOptionValue(type: CommandOptionType, value: unknown): typeof type extends "boolean" ? boolean : typeof type extends "number" ? number : string {
	switch (type) {
		case "string":
			if (value === null) return "null";
			else if (value === undefined) return "undefined";
			return String(value);

		case "number":
			if (typeof value === "number") return value as unknown as string;
			else if (value === true) return 1 as unknown as string;
			else if (value === false) return 0 as unknown as string;
			return parseFloat(value as string) as unknown as string;
		case "boolean":
			if (value === "true" || value === "" || value === "1" || value === 1) return true as unknown as string;
			else if (value === "false" || value === "0" || value === 0) return false as unknown as string;
			return Boolean(value) as unknown as string;
	}
}

/**
 * Formats the given option flags
 */
function formatOptionFlags(shortHand: string | undefined, longHand: string): string {
	const formattedLongHand = `${longHand} [arg]`;
	return shortHand != null ? `-${shortHand}, --${formattedLongHand}` : `--${formattedLongHand}`;
}

/**
 * Formats the given command name, along with its arguments
 */
function formatCommandNameWithArgs<T extends CreateCommandOptions>(options: T): string {
	const formattedArgs = Object.entries(options.args)
		.map(([argName, {type, required}]) => {
			const left = required ? `<` : `[`;
			const right = required ? ">" : `]`;
			if (type === "string[]") {
				return `${left}${argName}...${right}`;
			} else {
				return `${left}${argName}${right}`;
			}
		})
		.join(" ");
	return `${options.name} ${formattedArgs}`;
}

/**
 * Creates a new command
 */
export function createCommand<T extends CreateCommandOptions>(program: CliProgram, options: T, action: CommandAction<T>): void {
	// Add the command to the program
	const result = program
		.command(formatCommandNameWithArgs(options), {
			isDefault: options.isDefault
		})
		.description(options.description);

	// Add options to the command
	Object.entries(options.options).forEach(([longhand, {shortHand, description, type, defaultValue}]) => {
		result.option(formatOptionFlags(shortHand, longhand), description, coerceOptionValue.bind(null, type), defaultValue);
	});

	// Add the action to the command
	result.action((...args: unknown[]) => {
		const actionOptions = {} as CommandActionOptions<T>;

		let offset = 0;

		for (const key of Object.keys(options.args)) {
			actionOptions[key as keyof CommandActionOptions<T>] = args[offset++] as never;
		}

		Object.assign(actionOptions, args[offset]);

		// Invoke the action
		action(actionOptions);
	});
}
