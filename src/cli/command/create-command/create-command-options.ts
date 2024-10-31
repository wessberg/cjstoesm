export type CommandOptionType = "string" | "number" | "boolean";
export type CommandArgType = "string" | "string[]";

export interface CommandOption {
	shortHand?: string;
	type: CommandOptionType;
	defaultValue?: unknown;
	description: string;
}

export type CommandOptions = Record<string, CommandOption>;

export interface CommandArg {
	type: CommandArgType;
	required: boolean;
}

export type CommandArgs = Record<string, CommandArg>;

export interface CreateCommandOptions {
	name: string;
	description: string;
	args: CommandArgs;
	options: CommandOptions;
	isDefault: boolean;
}

export type CommandActionOptions<T extends CreateCommandOptions, U extends T["options"] = T["options"], J extends T["args"] = T["args"]> = {
	[Key in keyof U]: U[Key]["type"] extends "number" ? number : U[Key]["type"] extends "boolean" ? boolean : string;
} & {[Key in keyof J]: J[Key]["type"] extends "string[]" ? string[] : string};

export type CommandAction<T extends CreateCommandOptions> = (options: CommandActionOptions<T>) => void;
