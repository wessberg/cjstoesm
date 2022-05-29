/**
 * Returns the given Expression itself if it isn't considered a "filler node"
 *
 * @param expression
 * @returns
 */
import {TS} from "../../type/ts.js";

export function walkThroughFillerNodes(expression: TS.Expression, typescript: typeof TS): TS.Expression {
	// noinspection JSDeprecatedSymbols
	if (
		typescript.isParenthesizedExpression(expression) ||
		typescript.isAsExpression(expression) ||
		typescript.isTypeAssertionExpression?.(expression) ||
		typescript.isTypeAssertion?.(expression) ||
		typescript.isNonNullExpression(expression) ||
		typescript.isExpressionWithTypeArguments(expression)
	) {
		return expression.expression;
	}

	return expression;
}
