import {isStatement} from "./is-statement";
import {isDeclaration} from "./is-declaration";
import {TS} from "../../type/ts";

/**
 * Returns true if the given Node is a Statement is a Declaration
 */
export function isStatementOrDeclaration(node: TS.Node, typescript: typeof TS): node is TS.Statement | TS.Declaration {
	return isStatement(node, typescript) || isDeclaration(node, typescript);
}
