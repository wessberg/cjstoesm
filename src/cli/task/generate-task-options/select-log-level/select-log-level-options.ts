import {SHARED_OPTIONS} from "../../../command/shared/shared-options";
import {SanitizedSharedOptions} from "../sanitized-shared-options";

export type SelectLogLevelOptions<
	T = Pick<
		typeof SHARED_OPTIONS,
		{[Key in keyof typeof SHARED_OPTIONS]: (typeof SHARED_OPTIONS[Key]["type"] extends "boolean" ? Key : never)}[keyof typeof SHARED_OPTIONS]
	>
> = SanitizedSharedOptions<T>;
