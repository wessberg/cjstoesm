import type {TS} from "../../type/ts.js";

export function isNamedDeclaration(node: TS.Node | TS.NamedDeclaration, typescript: typeof TS): node is TS.NamedDeclaration {
	if (typescript.isPropertyAccessExpression(node)) return false;
	return "name" in node && node.name != null;
}
