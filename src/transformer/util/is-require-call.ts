import {isIdentifier, isStringLiteralLike, SourceFile, Expression, isCallExpression} from "typescript";
import {VisitorContext} from "../visitor-context";
import {resolvePath} from "./resolve-path";
import {normalize} from "path";
import {walkThroughFillerNodes} from "./walk-through-filler-nodes";
import {isBuiltInModule} from "../built-in/built-in-module-map";

export interface IsRequireCallNoMatchResult {
	match: false;
}

export interface IsRequireCallMatchResultWithNoResolvedModuleSpecifier {
	match: true;
	moduleSpecifier: string | undefined;
	resolvedModuleSpecifier: undefined;
	resolvedModuleSpecifierText: undefined;
}

export interface IsRequireCallMatchResultWithResolvedModuleSpecifier {
	match: true;
	moduleSpecifier: string;
	resolvedModuleSpecifier: string;
	resolvedModuleSpecifierText: string;
}

export type IsRequireCallResult =
	| IsRequireCallNoMatchResult
	| IsRequireCallMatchResultWithNoResolvedModuleSpecifier
	| IsRequireCallMatchResultWithResolvedModuleSpecifier;

/**
 * Checks if the CallExpression represents a require call (e.g.: 'require(...)')
 * @param {Expression} inputExpression
 * @param {SourceFile} sourceFile
 * @param {VisitorContext} context
 * @return {IsRequireCallResult}
 */
export function isRequireCall(inputExpression: Expression, sourceFile: SourceFile, context: VisitorContext): IsRequireCallResult {
	const callExpression = walkThroughFillerNodes(inputExpression);
	if (!isCallExpression(callExpression)) return {match: false};

	const expression = walkThroughFillerNodes(callExpression.expression);
	if (!isIdentifier(expression) || expression.text !== "require") return {match: false};

	// Take the first argument, if there is any
	const [firstArgument] = callExpression.arguments;
	if (firstArgument == null) return {match: false};

	const moduleSpecifier = isStringLiteralLike(firstArgument) ? firstArgument.text : undefined;

	const resolvedModuleSpecifier =
		moduleSpecifier == null
			? undefined
			: resolvePath({
					id: moduleSpecifier,
					parent: normalize(sourceFile.fileName),
					readFile: context.readFile,
					fileExists: context.fileExists
			  });

	const resolvedModuleSpecifierText =
		resolvedModuleSpecifier == null || isBuiltInModule(resolvedModuleSpecifier) ? undefined : context.readFile(resolvedModuleSpecifier);

	if (moduleSpecifier == null || resolvedModuleSpecifier == null || resolvedModuleSpecifierText == null) {
		return {
			match: true,
			moduleSpecifier,
			resolvedModuleSpecifier: undefined,
			resolvedModuleSpecifierText: undefined
		};
	} else {
		return {
			match: true,
			moduleSpecifier,
			resolvedModuleSpecifier: normalize(resolvedModuleSpecifier),
			resolvedModuleSpecifierText
		};
	}
}
