import {TS} from "../../type/ts";

export function nodeContainsSuper<T extends TS.Node>(node: T, typescript: typeof TS): boolean {
	if (node.kind === typescript.SyntaxKind.ThisKeyword) return true;
	return typescript.forEachChild<boolean>(node, nextNode => nodeContainsSuper(nextNode, typescript)) === true;
}
