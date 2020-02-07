import * as ts from "typescript";
import {isStatement} from "./is-statement";
import {isDeclaration} from "./is-declaration";

/**
 * Returns true if the given Node is a Statement is a Declaration
 *
 * @param node
 * @return
 */
export function isStatementOrDeclaration(node: ts.Node): node is ts.Statement | ts.Declaration {
	return isStatement(node) || isDeclaration(node);
}
