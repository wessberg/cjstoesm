import type {TS} from "../../type/ts.js";

/**
 * Returns true if the given Node is an Expression.
 * Uses an internal non-exposed Typescript helper to decide whether or not the Node is an Expression
 */
export function isExpression(node: TS.Node, typescript: typeof TS): node is TS.Expression {
	try {
		return (typescript as unknown as {isExpressionNode(node: TS.Node): boolean}).isExpressionNode(node) || typescript.isIdentifier(node);
	} catch {
		return false;
	}
}
