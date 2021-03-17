import {camelCase} from "@wessberg/stringutil";
import {parse} from "./path-util";

/**
 * Generates a proper name based on the given module specifier
 */
export function generateNameFromModuleSpecifier(moduleSpecifier: string): string {
	const {name} = parse(moduleSpecifier);
	return camelCase(name);
}
