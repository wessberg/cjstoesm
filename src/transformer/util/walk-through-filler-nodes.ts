import {Expression, isAsExpression, isExpressionWithTypeArguments, isNonNullExpression, isParenthesizedExpression, isTypeAssertion} from "typescript";

/**
 * Returns the given Expression itself if it isn't considered a "filler node"
 * @param {Expression} expression
 * @returns {Expression}
 */
export function walkThroughFillerNodes(expression: Expression): Expression {
	if (
		isParenthesizedExpression(expression) ||
		isAsExpression(expression) ||
		isTypeAssertion(expression) ||
		isNonNullExpression(expression) ||
		isTypeAssertion(expression) ||
		isExpressionWithTypeArguments(expression)
	) {
		return expression.expression;
	}

	return expression;
}
