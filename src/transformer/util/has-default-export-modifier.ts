import {hasExportModifier} from "./has-export-modifier";
import {TS} from "../../type/ts";

export function hasDefaultExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return hasExportModifier(node, typescript) && node.modifiers != null && node.modifiers.some(m => m.kind === typescript.SyntaxKind.DefaultKeyword);
}
