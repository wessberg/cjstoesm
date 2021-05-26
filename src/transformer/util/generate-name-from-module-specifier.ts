import {camelCase} from "@wessberg/stringutil";
import path from "crosspath";

/**
 * Generates a proper name based on the given module specifier
 */
export function generateNameFromModuleSpecifier(moduleSpecifier: string): string {
	const {name} = path.parse(moduleSpecifier);
	return camelCase(name);
}
