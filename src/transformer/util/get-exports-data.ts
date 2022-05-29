import {walkThroughFillerNodes} from "./walk-through-filler-nodes.js";
import {TS} from "../../type/ts.js";

export interface ExportsData {
	property: string;
}

export function getExportsData(expression: TS.Expression, exportsName = "exports", typescript: typeof TS): Partial<ExportsData> | undefined {
	expression = walkThroughFillerNodes(expression, typescript);

	if (typescript.isIdentifier(expression)) {
		if (expression.text === exportsName) {
			return {};
		} else {
			return undefined;
		}
	} else if (typescript.isPropertyAccessExpression(expression)) {
		const left = walkThroughFillerNodes(expression.expression, typescript);
		const right = expression.name;

		// If the left-hand side is an identifier, it may be something like 'module.exports',
		// but it may also be something completely unrelated such as 'foo.bar'
		if (typescript.isIdentifier(left)) {
			if (left.text === "module" && right.text === exportsName) {
				return {};
			}

			// This will be something like 'exports.foo'
			else if (left.text === exportsName) {
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
			const leftData = getExportsData(left, exportsName, typescript);
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
	} else if (typescript.isElementAccessExpression(expression)) {
		const left = walkThroughFillerNodes(expression.expression, typescript);
		const right = walkThroughFillerNodes(expression.argumentExpression, typescript);

		// If the argument expression is something that isn't statically analyzable, skip it
		if (!typescript.isStringLiteralLike(right)) return undefined;

		// If the left-hand side is an identifier, it may be something like 'module.exports',
		// but it may also be something completely unrelated such as 'foo.bar'
		if (typescript.isIdentifier(left)) {
			if (left.text === "module" && right.text === exportsName) {
				return {};
			}

			// This will be something like 'exports.foo'
			else if (left.text === exportsName) {
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
			const leftData = getExportsData(left, exportsName, typescript);
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
