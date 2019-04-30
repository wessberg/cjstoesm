import * as ts from "typescript";

/**
 * Returns true if the given Node is an Expression.
 * Uses an internal non-exposed Typescript helper to decide whether or not the Node is an Expression
 * @param {Node} node
 * @return {node is Expression}
 */
export function isExpression(node: ts.Node): node is ts.Expression {
	return ((ts as unknown) as {isExpressionNode(node: ts.Node): boolean}).isExpressionNode(node) || ts.isIdentifier(node);
}
