import {BindingName, isIdentifier, isObjectBindingPattern, isOmittedExpression} from "typescript";

export function getLocalsForBindingName(name: BindingName): string[] {
	if (isIdentifier(name)) {
		return [name.text];
	} else if (isObjectBindingPattern(name)) {
		const locals: string[] = [];
		for (const element of name.elements) {
			locals.push(...getLocalsForBindingName(element.name));
		}
		return locals;
	} else {
		const locals: string[] = [];
		for (const element of name.elements) {
			if (isOmittedExpression(element)) continue;
			locals.push(...getLocalsForBindingName(element.name));
		}
		return locals;
	}
}
