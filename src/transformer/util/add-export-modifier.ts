import {createModifier, createNodeArray, ModifiersArray, SyntaxKind} from "typescript";

export function addExportModifier<T extends ModifiersArray>(modifiers: T | undefined): T extends ModifiersArray ? ModifiersArray : undefined {
	if (modifiers == null) {
		modifiers = createNodeArray() as T;
	} else if (modifiers.some(m => m.kind === SyntaxKind.ExportKeyword)) {
		return (modifiers as unknown) as T extends ModifiersArray ? ModifiersArray : undefined;
	}

	return createNodeArray([createModifier(SyntaxKind.ExportKeyword), ...modifiers.map(m => createModifier(m.kind))]) as T extends ModifiersArray ? ModifiersArray : undefined;
}
