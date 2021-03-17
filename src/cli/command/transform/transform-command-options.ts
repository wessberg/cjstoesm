export const TRANSFORM_COMMAND_OPTIONS = {
	"preserve-module-specifiers": {
		shortHand: "p",
		type: "string",
		defaultValue: "external",
		description: `Determines whether or not module specifiers are preserved. Possible values are: "external", "internal", "always", and "never"`
	}
} as const;