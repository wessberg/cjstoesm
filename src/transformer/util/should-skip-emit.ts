import {isNotEmittedStatement} from "../visitor/visit/is-not-emitted-statement.js";
import {TS} from "../../type/ts.js";
import { isNodeArray } from './is-node-array.js'

/**
 * Returns true if the given Node contains an empty child
 */
export function shouldSkipEmit(node: TS.VisitResult<TS.Node|undefined>, typescript: typeof TS): boolean {
	if (!node) return true;
	if (isNodeArray(node)) return node.some(otherNode => shouldSkipEmit(otherNode, typescript));
	if (typescript.isSourceFile(node)) return false;
	if (typescript.isBlock(node)) return false;
	return isNotEmittedStatement(node, typescript) || Boolean(typescript.forEachChild<boolean>(node, nextNode => shouldSkipEmit(nextNode, typescript)));
}
