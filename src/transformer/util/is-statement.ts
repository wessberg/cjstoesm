import * as ts from "typescript";

/**
 * Returns true if the given Node is a Statement
 * Uses an internal non-exposed Typescript helper to decide whether or not the Node is an Expression
 * @param {Node} node
 * @return {node is Statement}
 */
export function isStatement(node: ts.Node): node is ts.Statement {
	return ((ts as unknown) as {isStatementButNotDeclaration(node: ts.Node): boolean}).isStatementButNotDeclaration(node);
}
