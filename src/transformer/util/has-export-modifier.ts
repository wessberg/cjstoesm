import {Node, SyntaxKind} from "typescript";

export function hasExportModifier(node: Node): boolean {
	return node.modifiers != null && node.modifiers.some(m => m.kind === SyntaxKind.ExportKeyword);
}
