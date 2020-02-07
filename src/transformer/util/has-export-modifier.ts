import {TS} from "../../type/type";

export function hasExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return node.modifiers != null && node.modifiers.some(m => m.kind === typescript.SyntaxKind.ExportKeyword);
}
