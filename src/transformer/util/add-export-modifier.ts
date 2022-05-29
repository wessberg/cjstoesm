import {TS} from "../../type/ts.js";
import {VisitorContext} from "../visitor-context.js";

export function addExportModifier<T extends TS.ModifiersArray>(modifiers: T | undefined, context: VisitorContext): T extends TS.ModifiersArray ? TS.ModifiersArray : undefined {
	const {factory, typescript} = context;
	if (modifiers == null) {
		modifiers = factory.createNodeArray() as T;
	} else if (modifiers.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
		return modifiers as unknown as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined;
	}

	return factory.createNodeArray([
		factory.createModifier(typescript.SyntaxKind.ExportKeyword),
		...modifiers.map(m => factory.createModifier(m.kind))
	]) as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined;
}
