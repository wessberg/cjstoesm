import {BeforeVisitorOptions} from "../before-visitor-options.js";
import {isRequireCall} from "../../util/is-require-call.js";
import {walkThroughFillerNodes} from "../../util/walk-through-filler-nodes.js";
import {getModuleExportsFromRequireDataInContext} from "../../util/get-module-exports-from-require-data-in-context.js";
import {TS} from "../../../type/ts.js";
import {willReassignIdentifier} from "../../util/will-be-reassigned.js";
import {hasExportModifier} from "../../util/has-export-modifier.js";
import {findNodeUp} from "../../util/find-node-up.js";
import {maybeGenerateAssertClause} from "../../util/maybe-generate-assert-clause.js";
import { tsFactoryDecoratorsInterop } from '../../util/decorators-interop.js'

/**
 * Visits the given VariableDeclaration
 */
export function visitVariableDeclaration({node, childContinuation, sourceFile, context}: BeforeVisitorOptions<TS.VariableDeclaration>): TS.VisitResult<TS.Node|undefined> {
	if (context.onlyExports || node.initializer == null) {
		return childContinuation(node);
	}

	const {typescript, factory} = context;

	// Most sophisticated require(...) handling comes from the CallExpression visitor, but this Visitor is for rewriting simple
	// 'foo = require("bar")' or '{foo} = require("bar")' as well as '{foo: bar} = require("bar")' expressions

	const initializer = walkThroughFillerNodes(node.initializer, typescript);
	const statement = findNodeUp(node, typescript.isVariableStatement, n => typescript.isBlock(n) || typescript.isSourceFile(n));

	if (!typescript.isCallExpression(initializer)) {
		return childContinuation(node);
	}

	// Check if the initializer represents a require(...) call.
	const requireData = isRequireCall(initializer, sourceFile, context);

	// If it doesn't, proceed without applying any transformations
	if (!requireData.match) {
		return childContinuation(node);
	}

	// Otherwise, spread out the things we know about the require call
	const {moduleSpecifier, transformedModuleSpecifier} = requireData;

	// If no module specifier could be determined, proceed with the child continuation
	if (moduleSpecifier == null || transformedModuleSpecifier == null) {
		return childContinuation(node);
	}

	// If we've been able to resolve a module as well as its contents,
	// Check it for exports so that we know more about its internals, for example whether or not it has any named exports, etc
	const moduleExports = getModuleExportsFromRequireDataInContext(requireData, context);

	// This will be something like 'foo = require("bar")
	if (typescript.isIdentifier(node.name)) {
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

		// Otherwise, the 'foo = require("bar")' VariableDeclaration is part of an Exported VariableStatement such as 'export const foo = require("bar")',
		// and it should preferably be converted into an ExportDeclaration
		else if (statement != null && hasExportModifier(statement, typescript)) {
			const moduleSpecifierExpression = factory.createStringLiteral(transformedModuleSpecifier);

			if (moduleExports == null || moduleExports.hasDefaultExport) {
				const exportClause = factory.createNamedExports([
					factory.createExportSpecifier(false, node.name.text === "default" ? undefined : factory.createIdentifier("default"), factory.createIdentifier(node.name.text))
				]);

				context.addTrailingStatements(
					tsFactoryDecoratorsInterop(context, factory.createExportDeclaration)(
						undefined,
						false,
						exportClause,
						moduleSpecifierExpression,
					),
				);
				return undefined;
			}
			// Otherwise, if the TypeScript version supports named namespace exports
			else if (factory.createNamespaceExport != null) {
				const exportClause = factory.createNamespaceExport(factory.createIdentifier(node.name.text));

				context.addTrailingStatements(
					tsFactoryDecoratorsInterop(context, factory.createExportDeclaration)(
						undefined,
						false,
						exportClause,
						moduleSpecifierExpression,
					),
				);
				return undefined;
			}

			// Otherwise, for older TypeScript versions, we'll have to first import and then re-export the namespace
			else {
				context.addImport(
					tsFactoryDecoratorsInterop(context, factory.createImportDeclaration)(
						undefined,
						factory.createImportClause(false, undefined, factory.createNamespaceImport(factory.createIdentifier(node.name.text))),
						moduleSpecifierExpression,
						maybeGenerateAssertClause(context, transformedModuleSpecifier, moduleExports?.assert)
					),
					moduleSpecifier
				);
				const exportClause = factory.createNamedExports([factory.createExportSpecifier(false, undefined, factory.createIdentifier(node.name.text))]);
				context.addTrailingStatements(
					tsFactoryDecoratorsInterop(context, factory.createExportDeclaration)(
						undefined,
						false,
						exportClause,
					),
				);
				return undefined;
			}
		}

		// Otherwise, the 'foo = require("bar")' VariableDeclaration can be safely transformed into a simple import such as 'import foo from "bar"' or 'import * as foo from "bar"',
		// depending on whether or not the module has a default export
		else {
			const willReassign = willReassignIdentifier(node.name.text, sourceFile, typescript);
			const newName = willReassign ? context.getFreeIdentifier(node.name.text, true) : node.name.text;

			context.addImport(
				tsFactoryDecoratorsInterop(context, factory.createImportDeclaration)(
					undefined,

					moduleExports == null || moduleExports.hasDefaultExport
						? // Import the default if it has any (or if we don't know if it has)
						  factory.createImportClause(false, factory.createIdentifier(newName), undefined)
						: // Otherwise, import the entire namespace
						  factory.createImportClause(false, undefined, factory.createNamespaceImport(factory.createIdentifier(newName))),
					factory.createStringLiteral(transformedModuleSpecifier),
					maybeGenerateAssertClause(context, transformedModuleSpecifier, moduleExports?.assert)
				),
				moduleSpecifier
			);
			if (willReassign) {
				// Now, immediately add a local mutable variable with the correct name
				context.addLeadingStatements(
					factory.createVariableStatement(
						undefined,
						factory.createVariableDeclarationList(
							[factory.createVariableDeclaration(node.name.text, undefined, undefined, factory.createIdentifier(newName))],
							typescript.NodeFlags.Let
						)
					)
				);
			}
			return undefined;
		}
	}

	// This will be something like '{foo} = require("bar")', '{foo, bar} = require("bar")', '{foo: bar} = require("bar")', or event '{foo: {bar: baz}} = require("bar")'.
	// We will only consider the simplest variants of these before opting out and letting the CallExpression visitor handle more sophisticated behavior
	else if (moduleExports != null && typescript.isObjectBindingPattern(node.name)) {
		const importSpecifiers: TS.ImportSpecifier[] = [];
		for (const element of node.name.elements) {
			// When the propertyName is null, the name will always be an identifier.
			// This will be something like '{foo} = require("bar")'
			if (element.propertyName == null && typescript.isIdentifier(element.name)) {
				// If there is no named export matching the identifier, opt out and proceed with the
				// child continuation for more sophisticated handling
				if (!moduleExports.namedExports.has(element.name.text)) {
					return childContinuation(node);
				}

				importSpecifiers.push(factory.createImportSpecifier(false, undefined, factory.createIdentifier(element.name.text)));
			}

			// This will be something like '{foo: bar} = require("bar")'
			else if (element.propertyName != null && typescript.isIdentifier(element.propertyName) && typescript.isIdentifier(element.name)) {
				// If there is no named export matching the identifier of the property name, opt out and proceed with the
				// child continuation for more sophisticated handling
				if (!moduleExports.namedExports.has(element.propertyName.text)) {
					return childContinuation(node);
				}

				importSpecifiers.push(factory.createImportSpecifier(false, factory.createIdentifier(element.propertyName.text), factory.createIdentifier(element.name.text)));
			} else {
				// Opt out and proceed with the child continuation for more sophisticated handling
				return childContinuation(node);
			}
		}
		// If more than 0 import specifier was generated, add an ImportDeclaration and remove this VariableDeclaration
		if (importSpecifiers.length > 0) {
			const importSpecifiersThatWillBeReassigned = importSpecifiers.filter(importSpecifier => willReassignIdentifier(importSpecifier.name.text, sourceFile, typescript));
			const otherImportSpecifiers = importSpecifiers.filter(importSpecifier => !importSpecifiersThatWillBeReassigned.includes(importSpecifier));

			// Add an import, but bind the name to free identifier
			for (const importSpecifier of importSpecifiersThatWillBeReassigned) {
				const propertyName = importSpecifier.propertyName ?? importSpecifier.name;
				const newName = context.getFreeIdentifier(importSpecifier.name.text, true);

				const namedImports = factory.createNamedImports([factory.createImportSpecifier(false, factory.createIdentifier(propertyName.text), factory.createIdentifier(newName))]);

				context.addImport(
					tsFactoryDecoratorsInterop(context, factory.createImportDeclaration)(
						undefined,
						factory.createImportClause(false, undefined, namedImports),
						factory.createStringLiteral(transformedModuleSpecifier),
						maybeGenerateAssertClause(context, transformedModuleSpecifier, moduleExports?.assert)
					),
					moduleSpecifier
				);

				// Now, immediately add a local mutable variable with the correct name
				context.addLeadingStatements(
					factory.createVariableStatement(
						undefined,
						factory.createVariableDeclarationList(
							[factory.createVariableDeclaration(importSpecifier.name.text, undefined, undefined, factory.createIdentifier(newName))],
							typescript.NodeFlags.Let
						)
					)
				);
			}

			if (otherImportSpecifiers.length > 0) {
				context.addImport(
					tsFactoryDecoratorsInterop(context, factory.createImportDeclaration)(
						undefined,
						factory.createImportClause(false, undefined, factory.createNamedImports(otherImportSpecifiers)),
						factory.createStringLiteral(transformedModuleSpecifier),
						maybeGenerateAssertClause(context, transformedModuleSpecifier, moduleExports?.assert)
					),
					moduleSpecifier
				);
			}

			return undefined;
		}
	}

	// Otherwise, proceed with the child continuation
	return childContinuation(node);
}
