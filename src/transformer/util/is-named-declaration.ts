import {isPropertyAccessExpression, NamedDeclaration, Node} from "typescript";

export function isNamedDeclaration(node: Node | NamedDeclaration): node is NamedDeclaration {
	if (isPropertyAccessExpression(node)) return false;
	return "name" in node && node.name != null;
}
