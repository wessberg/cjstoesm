import {Expression, isElementAccessExpression, isIdentifier, isPropertyAccessExpression, isStringLiteralLike} from "typescript";
import {walkThroughFillerNodes} from "./walk-through-filler-nodes";

export interface ExportsData {
	property: string;
}

export function getExportsData(expression: Expression): Partial<ExportsData> | undefined {
	expression = walkThroughFillerNodes(expression);

	if (isIdentifier(expression)) {
		if (expression.text === "exports") {
			return {};
		} else {
			return undefined;
		}
	} else if (isPropertyAccessExpression(expression)) {
		const left = walkThroughFillerNodes(expression.expression);
		const right = expression.name;

		// If the left-hand side is an identifier, it may be something like 'module.exports',
		// but it may also be something completely unrelated such as 'foo.bar'
		if (isIdentifier(left)) {
			if (left.text === "module" && right.text === "exports") {
				return {};
			}

			// This will be something like 'exports.foo'
			else if (left.text === "exports") {
				return {
					property: right.text
				};
			}

			// This will be something completely unrelated
			else {
				return undefined;
			}
		} else {
			// Otherwise, check if the left-hand side leads to exports data
			const leftData = getExportsData(left);
			if (leftData == null) {
				return undefined;
			}

			// If it does, this is something like 'module.exports.foo'
			else {
				return {
					...leftData,
					property: right.text
				};
			}
		}
	} else if (isElementAccessExpression(expression)) {
		const left = walkThroughFillerNodes(expression.expression);
		const right = walkThroughFillerNodes(expression.argumentExpression);

		// If the argument expression is something that isn't statically analyzable, skip it
		if (!isStringLiteralLike(right)) return undefined;

		// If the left-hand side is an identifier, it may be something like 'module.exports',
		// but it may also be something completely unrelated such as 'foo.bar'
		if (isIdentifier(left)) {
			if (left.text === "module" && right.text === "exports") {
				return {};
			}

			// This will be something like 'exports.foo'
			else if (left.text === "exports") {
				return {
					property: right.text
				};
			}

			// This will be something completely unrelated
			else {
				return undefined;
			}
		} else {
			// Otherwise, check if the left-hand side leads to exports data
			const leftData = getExportsData(left);
			if (leftData == null) {
				return undefined;
			}

			// If it does, this is something like 'module.exports.foo'
			else {
				return {
					...leftData,
					property: right.text
				};
			}
		}
	} else {
		return undefined;
	}
}
