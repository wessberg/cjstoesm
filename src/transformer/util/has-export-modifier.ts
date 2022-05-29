import {TS} from "../../type/ts.js";

export function hasExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return node.modifiers != null && node.modifiers.some(m => m.kind === typescript.SyntaxKind.ExportKeyword);
}
