import type {VisitorContext} from "../visitor-context.js";
import {resolvePath} from "./resolve-path.js";
import {walkThroughFillerNodes} from "./walk-through-filler-nodes.js";
import {isBuiltInModule} from "../built-in/built-in-module-map.js";
import type {TS} from "../../type/ts.js";
import {transformModuleSpecifier} from "./transform-module-specifier.js";

export interface IsRequireCallNoMatchResult {
	match: false;
}

export interface IsRequireCallMatchResultWithNoResolvedModuleSpecifier {
	match: true;
	moduleSpecifier: string | undefined;
	transformedModuleSpecifier: string | undefined;
	resolvedModuleSpecifier: undefined;
	resolvedModuleSpecifierText: undefined;
}

export interface IsRequireCallMatchResultWithResolvedModuleSpecifier {
	match: true;
	moduleSpecifier: string;
	resolvedModuleSpecifier: string;
	resolvedModuleSpecifierText: string;
	transformedModuleSpecifier: string;
}

export type IsRequireCallResult = IsRequireCallNoMatchResult | IsRequireCallMatchResultWithNoResolvedModuleSpecifier | IsRequireCallMatchResultWithResolvedModuleSpecifier;

/**
 * Checks if the CallExpression represents a require call (e.g.: 'require(...)')
 */
export function isRequireCall(inputExpression: TS.Expression, sourceFile: TS.SourceFile, context: VisitorContext): IsRequireCallResult {
	const {typescript} = context;
	const callExpression = walkThroughFillerNodes(inputExpression, typescript);
	if (!typescript.isCallExpression(callExpression)) return {match: false};

	const expression = walkThroughFillerNodes(callExpression.expression, typescript);
	if (!typescript.isIdentifier(expression) || expression.text !== "require") return {match: false};

	// Take the first argument, if there is any
	const [firstArgument] = callExpression.arguments;
	if (firstArgument == null) return {match: false};

	const moduleSpecifier = typescript.isStringLiteralLike(firstArgument) ? firstArgument.text : undefined;

	const resolvedModuleSpecifier =
		moduleSpecifier == null
			? undefined
			: resolvePath({
					...context,
					id: moduleSpecifier,
					parent: sourceFile.fileName
				});

	const resolvedModuleSpecifierText =
		resolvedModuleSpecifier == null || isBuiltInModule(resolvedModuleSpecifier) ? undefined : context.fileSystem.safeReadFileSync(resolvedModuleSpecifier)?.toString();

	if (moduleSpecifier == null || resolvedModuleSpecifier == null || resolvedModuleSpecifierText == null) {
		return {
			match: true,
			moduleSpecifier,
			transformedModuleSpecifier: moduleSpecifier,
			resolvedModuleSpecifier: undefined,
			resolvedModuleSpecifierText: undefined
		};
	} else {
		return {
			match: true,
			transformedModuleSpecifier: transformModuleSpecifier(moduleSpecifier, {resolvedModuleSpecifier, context, parent: sourceFile.fileName}),
			moduleSpecifier,
			resolvedModuleSpecifier,
			resolvedModuleSpecifierText
		};
	}
}
