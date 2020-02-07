import {forEachChild, isSourceFile, Node, VisitResult} from "typescript";
import {isNotEmittedStatement} from "../before/visitor/visit/is-not-emitted-statement";

/**
 * Returns true if the given Node contains an empty child
 *
 * @param node
 * @return
 */
export function shouldSkipEmit(node: VisitResult<Node>): boolean {
	if (node == null) return true;
	if (Array.isArray(node)) return node.some(shouldSkipEmit);
	if (isSourceFile(node)) return false;
	return isNotEmittedStatement(node) || Boolean(forEachChild<boolean>(node, shouldSkipEmit));
}
