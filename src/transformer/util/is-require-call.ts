import {CallExpression, isIdentifier, isStringLiteralLike, SourceFile} from "typescript";
import {VisitorContext} from "../visitor-context";
import {resolvePath} from "./resolve-path";
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

export type IsRequireCallResult = IsRequireCallNoMatchResult | IsRequireCallMatchResultWithNoResolvedModuleSpecifier | IsRequireCallMatchResultWithResolvedModuleSpecifier;

/**
 * Checks if the CallExpression represents a require call (e.g.: 'require(...)')
 * @param {CallExpression} call
 * @param {SourceFile} sourceFile
 * @param {VisitorContext} context
 * @return {IsRequireCallResult}
 */
export function isRequireCall(call: CallExpression, sourceFile: SourceFile, context: VisitorContext): IsRequireCallResult {
	const expression = walkThroughFillerNodes(call.expression);
	if (!isIdentifier(expression) || expression.text !== "require") return {match: false};

	// Take the first argument, if there is any
	const [firstArgument] = call.arguments;
	if (firstArgument == null) return {match: false};

	const moduleSpecifier = isStringLiteralLike(firstArgument) ? firstArgument.text : undefined;

	const resolvedModuleSpecifier =
		moduleSpecifier == null
			? undefined
			: resolvePath({
					id: moduleSpecifier,
					parent: sourceFile.fileName,
					readFile: context.readFile,
					fileExists: context.fileExists
			  });

	const resolvedModuleSpecifierText = resolvedModuleSpecifier == null || isBuiltInModule(resolvedModuleSpecifier) ? undefined : context.readFile(resolvedModuleSpecifier);

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
			resolvedModuleSpecifier,
			resolvedModuleSpecifierText
		};
	}
}
