import {camelCase} from "@wessberg/stringutil";
import {parse} from "path";

/**
 * Generates a proper name based on the given module specifier
 *
 * @param moduleSpecifier
 * @return
 */
export function generateNameFromModuleSpecifier(moduleSpecifier: string): string {
	const {name} = parse(moduleSpecifier);
	return camelCase(name);
}
