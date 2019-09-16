import {SHARED_OPTIONS} from "../../command/shared/shared-options";

export type SanitizedSharedOptions<T = typeof SHARED_OPTIONS> = {
	// @ts-ignore
	[Key in keyof T]: T[Key]["type"] extends "boolean" ? boolean : T[Key]["type"] extends "number" ? number : string;
};
