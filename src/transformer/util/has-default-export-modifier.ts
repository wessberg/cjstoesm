import {hasExportModifier} from "./has-export-modifier.js";
import {TS} from "../../type/ts.js";
import { hasModifier } from './has-modifier.js'

export function hasDefaultExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return hasExportModifier(node, typescript) && hasModifier(node, typescript.SyntaxKind.DefaultKeyword)
}
