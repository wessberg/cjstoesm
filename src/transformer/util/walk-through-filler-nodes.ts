/**
 * Returns the given Expression itself if it isn't considered a "filler node"
 */
import {isTypeAssertionExpression} from "../../shared/util/util.js";
import type {TS} from "../../type/ts.js";

export function walkThroughFillerNodes(expression: TS.Expression, typescript: typeof TS): TS.Expression {
	if (
		typescript.isParenthesizedExpression(expression) ||
		typescript.isAsExpression(expression) ||
		isTypeAssertionExpression(expression, typescript) ||
		typescript.isNonNullExpression(expression) ||
		typescript.isExpressionWithTypeArguments(expression)
	) {
		return expression.expression;
	}

	return expression;
}
