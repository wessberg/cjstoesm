import {
	createIdentifier,
	createImportClause,
	createImportDeclaration,
	createImportSpecifier,
	createNamedImports,
	createNamespaceImport,
	createStringLiteral,
	ImportSpecifier,
	isCallExpression,
	isIdentifier,
	isObjectBindingPattern,
	Node,
	VariableDeclaration,
	VisitResult
} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";
import {isRequireCall} from "../../../util/is-require-call";
import {walkThroughFillerNodes} from "../../../util/walk-through-filler-nodes";
import {getModuleExportsFromRequireDataInContext} from "../../../util/get-module-exports-from-require-data-in-context";

/**
 * Visits the given VariableDeclaration
 *
 * @param options
 * @returns
 */
export function visitVariableDeclaration({
	node,
	childContinuation,
	sourceFile,
	context
}: BeforeVisitorOptions<VariableDeclaration>): VisitResult<Node> {
	if (context.onlyExports || node.initializer == null) {
		return childContinuation(node);
	}

	// Most sophisticated require(...) handling comes from the CallExpression visitor, but this Visitor is for rewriting simple
	// 'foo = require("bar")' or '{foo} = require("bar")' as well as '{foo: bar} = require("bar")' expressions

	const initializer = walkThroughFillerNodes(node.initializer);

	if (!isCallExpression(initializer)) {
		return childContinuation(node);
	}

	// Check if the initializer represents a require(...) call.
	const requireData = isRequireCall(initializer, sourceFile, context);

	// If it doesn't, proceed without applying any transformations
	if (!requireData.match) {
		return childContinuation(node);
	}

	// Otherwise, spread out the things we know about the require call
	const {moduleSpecifier} = requireData;

	// If no module specifier could be determined, proceed with the child continuation
	if (moduleSpecifier == null) {
		return childContinuation(node);
	}

	// If we've been able to resolve a module as well as its contents,
	// Check it for exports so that we know more about its internals, for example whether or not it has any named exports, etc
	const moduleExports = getModuleExportsFromRequireDataInContext(requireData, context);

	// This will be something like 'foo = require("bar")
	if (isIdentifier(node.name)) {
		// If the default export is already imported under the same local name as this VariableDeclaration binds,
		// proceed from the child continuation for more sophisticated behavior
		if ((moduleExports == null || moduleExports.hasDefaultExport) && context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
			return childContinuation(node);
		}

		// If the namespace is already imported, under the same local name as this VariableDeclaration binds,
		// proceed from the child continuation for more sophisticated behavior
		else if (moduleExports != null && !moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
			return childContinuation(node);
		}

		// Otherwise, the 'foo = require("bar")' VariableDeclaration can be safely transformed into a simple import such as 'import foo from "bar"' or 'import * as foo from "bar"',
		// depending on whether or not the module has a default export
		else {
			context.addImport(
				createImportDeclaration(
					undefined,
					undefined,

					moduleExports == null || moduleExports.hasDefaultExport
						? // Import the default if it has any (or if we don't know if it has)
						  createImportClause(createIdentifier(node.name.text), undefined)
						: // Otherwise, import the entire namespace
						  createImportClause(undefined, createNamespaceImport(createIdentifier(node.name.text))),
					createStringLiteral(moduleSpecifier)
				)
			);
			return undefined;
		}
	}

	// This will be something like '{foo} = require("bar")', '{foo, bar} = require("bar")', '{foo: bar} = require("bar")', or event '{foo: {bar: baz}} = require("bar")'.
	// We will only consider the simplest variants of these before opting out and letting the CallExpression visitor handle more sophisticated behavior
	else if (moduleExports != null && isObjectBindingPattern(node.name)) {
		const importSpecifiers: ImportSpecifier[] = [];
		for (const element of node.name.elements) {
			// When the propertyName is null, the name will always be an identifier.
			// This will be something like '{foo} = require("bar")'
			if (element.propertyName == null && isIdentifier(element.name)) {
				// If there is no named export matching the identifier, opt out and proceed with the
				// child continuation for more sophisticated handling
				if (!moduleExports.namedExports.has(element.name.text)) {
					return childContinuation(node);
				}

				importSpecifiers.push(createImportSpecifier(undefined, createIdentifier(element.name.text)));
			}

			// This will be something like '{foo: bar} = require("bar")'
			else if (element.propertyName != null && isIdentifier(element.propertyName) && isIdentifier(element.name)) {
				// If there is no named export matching the identifier of the property name, opt out and proceed with the
				// child continuation for more sophisticated handling
				if (!moduleExports.namedExports.has(element.propertyName.text)) {
					return childContinuation(node);
				}

				importSpecifiers.push(createImportSpecifier(createIdentifier(element.propertyName.text), createIdentifier(element.name.text)));
			} else {
				// Opt out and proceed with the child continuation for more sophisticated handling
				return childContinuation(node);
			}
		}
		// If more then 1 import specifier was generated, add an ImportDeclaration and remove this VariableDeclaration
		if (importSpecifiers.length > 0) {
			context.addImport(
				createImportDeclaration(
					undefined,
					undefined,
					createImportClause(undefined, createNamedImports(importSpecifiers)),
					createStringLiteral(moduleSpecifier)
				)
			);
			return undefined;
		}
	}

	// Otherwise, proceed with the child continuation
	return childContinuation(node);
}
