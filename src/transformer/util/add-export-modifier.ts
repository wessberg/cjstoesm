import {TS} from "../../type/type";

export function addExportModifier<T extends TS.ModifiersArray>(modifiers: T | undefined, typescript: typeof TS): T extends TS.ModifiersArray ? TS.ModifiersArray : undefined {
	if (modifiers == null) {
		modifiers = typescript.createNodeArray() as T;
	} else if (modifiers.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
		return (modifiers as unknown) as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined;
	}

	return typescript.createNodeArray([
		typescript.createModifier(typescript.SyntaxKind.ExportKeyword),
		...modifiers.map(m => typescript.createModifier(m.kind))
	]) as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined;
}
