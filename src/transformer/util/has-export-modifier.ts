import {TS} from "../../type/ts.js";
import { hasModifier } from './has-modifier.js'

export function hasExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return hasModifier(node, typescript.SyntaxKind.ExportKeyword);
}
