import type {TS} from "../../type/ts.js";

export function getLocalsForBindingName(name: TS.BindingName, typescript: typeof TS): string[] {
	if (typescript.isIdentifier(name)) {
		return [name.text];
	} else if (typescript.isObjectBindingPattern(name)) {
		const locals: string[] = [];
		for (const element of name.elements) {
			locals.push(...getLocalsForBindingName(element.name, typescript));
		}
		return locals;
	} else {
		const locals: string[] = [];
		for (const element of name.elements) {
			if (typescript.isOmittedExpression(element)) continue;
			locals.push(...getLocalsForBindingName(element.name, typescript));
		}
		return locals;
	}
}
