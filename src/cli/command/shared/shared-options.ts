export const SHARED_OPTIONS = {
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
	}
} as const;
