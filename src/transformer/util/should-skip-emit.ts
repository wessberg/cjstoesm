import {isNotEmittedStatement} from "../before/visitor/visit/is-not-emitted-statement";
import {TS} from "../../type/ts";

/**
 * Returns true if the given Node contains an empty child
 */
export function shouldSkipEmit(node: TS.VisitResult<TS.Node>, typescript: typeof TS): boolean {
	if (node == null) return true;
	if (Array.isArray(node)) return node.some(otherNode => shouldSkipEmit(otherNode, typescript));
	if (typescript.isSourceFile(node)) return false;
	if (typescript.isBlock(node)) return false;
	return isNotEmittedStatement(node, typescript) || Boolean(typescript.forEachChild<boolean>(node, nextNode => shouldSkipEmit(nextNode, typescript)));
}
