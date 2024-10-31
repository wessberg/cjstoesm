import {isStatement} from "./is-statement.js";
import {isDeclaration} from "./is-declaration.js";
import type {TS} from "../../type/ts.js";

/**
 * Returns true if the given Node is a Statement is a Declaration
 */
export function isStatementOrDeclaration(node: TS.Node, typescript: typeof TS): node is TS.Statement | TS.Declaration {
	return isStatement(node, typescript) || isDeclaration(node, typescript);
}
