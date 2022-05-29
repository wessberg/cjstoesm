import {hasExportModifier} from "./has-export-modifier.js";
import {TS} from "../../type/ts.js";

export function hasDefaultExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return hasExportModifier(node, typescript) && node.modifiers != null && node.modifiers.some(m => m.kind === typescript.SyntaxKind.DefaultKeyword);
}
