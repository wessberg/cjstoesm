import * as ts from "typescript";

/**
 * Returns true if the given Node is a Declaration
 * Uses an internal non-exposed Typescript helper to decide whether or not the Node is an Expression
 * @param {Node} node
 * @return {node is Declaration}
 */
export function isDeclaration(node: ts.Node): node is ts.Declaration {
	return ((ts as unknown) as {isDeclaration(node: ts.Node): boolean}).isDeclaration(node);
}
