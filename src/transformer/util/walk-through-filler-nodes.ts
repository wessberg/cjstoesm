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
		isTypeAssertion(typescript)(expression) ||
		typescript.isNonNullExpression(expression) ||
		typescript.isExpressionWithTypeArguments(expression)
	) {
		return expression.expression;
	}

	return expression;
}

function isTypeAssertion(typescript: typeof TS) {
	const t = typescript as (
		// modern
		| {isTypeAssertionExpression: typeof TS.isTypeAssertionExpression}
		// legacy
		| {isTypeAssertion: typeof TS.isTypeAssertionExpression}
	)
	return 'isTypeAssertionExpression' in t
		? t.isTypeAssertionExpression
		: t.isTypeAssertion
}
