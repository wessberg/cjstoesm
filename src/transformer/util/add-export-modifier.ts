import {TS} from "../../type/ts";
import {CompatFactory} from "../../type/compat-factory";

export function addExportModifier<T extends TS.ModifiersArray>(
	modifiers: T | undefined,
	typescript: typeof TS,
	compatFactory: CompatFactory
): T extends TS.ModifiersArray ? TS.ModifiersArray : undefined {
	if (modifiers == null) {
		modifiers = compatFactory.createNodeArray() as T;
	} else if (modifiers.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
		return modifiers as unknown as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined;
	}

	return compatFactory.createNodeArray([
		compatFactory.createModifier(typescript.SyntaxKind.ExportKeyword),
		...modifiers.map(m => compatFactory.createModifier(m.kind))
	]) as T extends TS.ModifiersArray ? TS.ModifiersArray : undefined;
}
