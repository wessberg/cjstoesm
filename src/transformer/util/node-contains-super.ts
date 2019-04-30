import {forEachChild, Node, SyntaxKind} from "typescript";

export function nodeContainsSuper<T extends Node>(node: T): boolean {
	if (node.kind === SyntaxKind.ThisKeyword) return true;
	return forEachChild<boolean>(node, nodeContainsSuper) === true;
}
