/**
 * Returns the given Expression itself if it isn't considered a "filler node"
 *
 * @param expression
 * @returns
 */
import {TS} from "../../type/ts";

export function walkThroughFillerNodes(expression: TS.Expression, typescript: typeof TS): TS.Expression {
	if (
		typescript.isParenthesizedExpression(expression) ||
		typescript.isAsExpression(expression) ||
		typescript.isTypeAssertion(expression) ||
		typescript.isNonNullExpression(expression) ||
		typescript.isTypeAssertion(expression) ||
		typescript.isExpressionWithTypeArguments(expression)
	) {
		return expression.expression;
	}

	return expression;
}
