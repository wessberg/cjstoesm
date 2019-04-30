import {Node, SyntaxKind} from "typescript";
import {hasExportModifier} from "./has-export-modifier";

export function hasDefaultExportModifier(node: Node): boolean {
	return hasExportModifier(node) && node.modifiers != null && node.modifiers.some(m => m.kind === SyntaxKind.DefaultKeyword);
}
