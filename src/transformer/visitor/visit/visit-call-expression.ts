import {BeforeVisitorOptions} from "../before-visitor-options.js";
import {isRequireCall} from "../../util/is-require-call.js";
import {findNodeUp} from "../../util/find-node-up.js";
import {isStatementOrDeclaration} from "../../util/is-statement-or-declaration.js";
import {isStatement} from "../../util/is-statement.js";
import {generateNameFromModuleSpecifier} from "../../util/generate-name-from-module-specifier.js";
import {getModuleExportsFromRequireDataInContext} from "../../util/get-module-exports-from-require-data-in-context.js";
import {TS} from "../../../type/ts.js";
import {shouldDebug} from "../../util/should-debug.js";
import {walkThroughFillerNodes} from "../../util/walk-through-filler-nodes.js";

/**
 * Visits the given CallExpression
 *
 * @param options
 * @returns
 */
export function visitCallExpression({node, childContinuation, sourceFile, context}: BeforeVisitorOptions<TS.CallExpression>): TS.VisitResult<TS.Node> {
	if (context.onlyExports) {
		return childContinuation(node);
	}

	// Check if the node represents a require(...) call.
	const requireData = isRequireCall(node, sourceFile, context);
	const {typescript, factory} = context;

	// If it doesn't proceed without applying any transformations
	if (!requireData.match) {
		return childContinuation(node);
	}

	// Otherwise, spread out the things we know about the require call
	const {moduleSpecifier, transformedModuleSpecifier} = requireData;

	// If no module specifier could be determined, remove the CallExpression from the SourceFile
	if (moduleSpecifier == null || transformedModuleSpecifier == null) {
		return undefined;
	}

	// If we've been able to resolve a module as well as its contents,
	// Check it for exports so that we know more about its internals, for example whether or not it has any named exports, etc
	const moduleExports = getModuleExportsFromRequireDataInContext(requireData, context);

	// Find the first ExpressionStatement going up from the Node, breaking if part of a BinaryExpression, CallExpression, or a NewExpression
	const expressionStatementParent = findNodeUp(
		node,
		typescript.isExpressionStatement,
		currentNode => typescript.isBinaryExpression(currentNode) || typescript.isCallExpression(currentNode) || typescript.isNewExpression(currentNode)
	);

	// If we don't know anything about the exports of the module, or if it doesn't export any named exports,
	// there's really not much we can do in terms of using the context of the CallExpression to import the maximally
	// minimal subset of the module. In these cases, the only thing that can be done is to import the default
	// export and maybe return an identifier for it depending on whether or not the CallExpression is part of an ExpressionStatement
	if (moduleExports == null || moduleExports.namedExports.size === 0 || (expressionStatementParent != null && !moduleExports.hasDefaultExport)) {
		// If part of an ExpressionStatement, simply return the module without any name or other bindings
		if (expressionStatementParent != null) {
			// Only add the import if there isn't already an import within the SourceFile of the entire module without any bindings
			if (!context.isModuleSpecifierImportedWithoutLocals(moduleSpecifier)) {
				context.addImport(factory.createImportDeclaration(undefined, undefined, undefined, factory.createStringLiteral(transformedModuleSpecifier)), moduleSpecifier);
			}

			// Drop this CallExpression
			return undefined;
		}

		// Otherwise, we need to give the module a name and replace the CallExpression with an identifier for it
		else {
			// If the default export is already imported, get the local binding name for it and create an identifier for it
			// rather than generating a new unnecessary import
			if (context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
				const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!;
				return factory.createIdentifier(local);
			} else {
				const identifier = factory.createIdentifier(context.getFreeIdentifier(generateNameFromModuleSpecifier(moduleSpecifier)));

				const importClause = factory.createImportClause(false, identifier, undefined);

				context.addImport(factory.createImportDeclaration(undefined, undefined, importClause, factory.createStringLiteral(transformedModuleSpecifier)), moduleSpecifier);

				// Replace the CallExpression by the identifier
				return identifier;
			}
		}
	}

	// Otherwise, we know that we want to add an import instead of the CallExpression, but depending on the context of the CallExpression, we may
	// or may not import specific Named Exports, the Default Export, or the entire namespace.

	// Find the first Element- or PropertyAccessExpression that wraps the require(...) call, whatever it is.
	// That means that if it is wrapped in 'require(...)["foo"].bar', then the ElementAccessExpression will be matched first
	const elementOrPropertyAccessExpressionParent = findNodeUp<TS.PropertyAccessExpression | TS.ElementAccessExpression>(
		node,
		child => typescript.isElementAccessExpression(child) || typescript.isPropertyAccessExpression(child),
		nextNode => isStatementOrDeclaration(nextNode, typescript)
	);

	if (elementOrPropertyAccessExpressionParent != null) {
		// Try to evaluate the name or argument expression, depending on the kind of node
		let rightValue: string | undefined;

		// If it is a PropertyAccessExpression, the name will always be an identifier
		if (typescript.isPropertyAccessExpression(elementOrPropertyAccessExpressionParent)) {
			rightValue = elementOrPropertyAccessExpressionParent.name.text;
		} else {
			// Otherwise, the argument may be any kind of expression. Try to evaluate it to a string literal if possible
			if (typescript.isStringLiteralLike(elementOrPropertyAccessExpressionParent.argumentExpression)) {
				rightValue = elementOrPropertyAccessExpressionParent.argumentExpression.text;
			}
		}

		// The argumentExpression or name matched a string, use that as a candidate for a lookup binding
		if (rightValue != null) {
			// If the module doesn't include a named export with a name matching the right value,
			// we should instead import the default export if it has any (otherwise we'll use a Namespace import) and replace the CallExpression with an identifier for it
			if (!moduleExports.namedExports.has(rightValue)) {
				let identifier: TS.Identifier;

				// If the default export is already imported, get the local binding name for it and create an identifier for it
				// rather than generating a new unnecessary import
				if (moduleExports.hasDefaultExport && context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
					identifier = factory.createIdentifier(context.getLocalForDefaultImportFromModule(moduleSpecifier)!);
				}

				// If the namespace is already imported, get the local binding name for it and create an identifier for it
				// rather than generating a new unnecessary import
				else if (!moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
					identifier = factory.createIdentifier(context.getLocalForNamespaceImportFromModule(moduleSpecifier)!);
				} else {
					identifier = factory.createIdentifier(context.getFreeIdentifier(generateNameFromModuleSpecifier(moduleSpecifier)));

					context.addImport(
						factory.createImportDeclaration(
							undefined,
							undefined,

							moduleExports.hasDefaultExport
								? // Import the default if it has any (or if we don't know if it has)
								  factory.createImportClause(false, identifier, undefined)
								: // Otherwise, import the entire namespace
								  factory.createImportClause(false, undefined, factory.createNamespaceImport(identifier)),
							factory.createStringLiteral(transformedModuleSpecifier)
						),
						moduleSpecifier
					);
				}

				// Replace the CallExpression by an ObjectLiteral that can be accessed by the wrapping Element- or PropertyAccessExpression
				const objectLiteralProperties = [
					identifier.text !== rightValue
						? factory.createPropertyAssignment(rightValue, factory.createIdentifier(identifier.text))
						: factory.createShorthandPropertyAssignment(factory.createIdentifier(identifier.text))
				];
				return factory.createObjectLiteralExpression(objectLiteralProperties);
			}

			// Otherwise, use the right value as the ImportSpecifier for a new import.
			// Depending on the placement of the CallExpression, we may or may not need to
			// replace it with an identifier or remove it entirely in favor of the ImportDeclaration
			else {
				// The property to import will be equal to the right value
				const importBindingPropertyName = rightValue;

				let importBindingName: string;

				// If the default export is already imported, get the local binding name for it and create an identifier for it
				// rather than generating a new unnecessary import
				if (context.hasLocalForNamedImportPropertyNameFromModule(importBindingPropertyName, moduleSpecifier)) {
					importBindingName = context.getLocalForNamedImportPropertyNameFromModule(importBindingPropertyName, moduleSpecifier)!;
				}

				// If the namespace is already imported, get the local binding name for it and create an identifier for it
				// rather than generating a new unnecessary import
				else if (!moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
					importBindingName = context.getLocalForNamespaceImportFromModule(moduleSpecifier)!;
				} else {
					// If that binding isn't free within the context, import it as another local name
					importBindingName = context.getFreeIdentifier(importBindingPropertyName);

					const namedImports = factory.createNamedImports([
						importBindingPropertyName === importBindingName
							? // If the property name is free within the context, don't alias the import
							  factory.createImportSpecifier(false, undefined, factory.createIdentifier(importBindingPropertyName))
							: // Otherwise, import it aliased by another name that is free within the context
							  factory.createImportSpecifier(false, factory.createIdentifier(importBindingPropertyName), factory.createIdentifier(importBindingName))
					]);

					const importClause = factory.createImportClause(false, undefined, namedImports);

					context.addImport(factory.createImportDeclaration(undefined, undefined, importClause, factory.createStringLiteral(transformedModuleSpecifier)), moduleSpecifier);
				}

				// If the 'require(...)[<something>]' or 'require(...).<something>' expression is part of an ExpressionStatement
				// and isn't part of another expression such as a BinaryExpression, only preserve the import.
				// Otherwise leave an ObjectLiteral that can be accessed by the wrapping Element- or PropertyAccessExpression
				if (expressionStatementParent == null) {
					const objectLiteralProperties = [
						importBindingName !== rightValue
							? factory.createPropertyAssignment(rightValue, factory.createIdentifier(importBindingName))
							: factory.createShorthandPropertyAssignment(factory.createIdentifier(importBindingName))
					];
					return factory.createObjectLiteralExpression(objectLiteralProperties);
				} else {
					return undefined;
				}
			}
		}
	}

	// If no lookup binding candidate has been determined, it may be determined based on the parent VariableDeclaration,
	// if there is any.

	// Find the first VariableDeclaration that holds the require(...) call, if any.
	// For example, 'const foo = require(...)' would match the VariableDeclaration for 'foo'
	const variableDeclarationParent = findNodeUp(node, typescript.isVariableDeclaration, nextNode => isStatement(nextNode, typescript));

	if (variableDeclarationParent != null) {
		// If the VariableDeclaration is simply bound to a name, it doesn't tell us anything interesting.
		// Simply add an import for the default export - if it has any (otherwise we'll import the entire namespace), and
		// replace this CallExpression by an identifier for it
		if (typescript.isIdentifier(variableDeclarationParent.name)) {
			// If the default export is already imported, get the local binding name for it and create an identifier for it
			// rather than generating a new unnecessary import
			if (moduleExports.hasDefaultExport && context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
				const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!;
				return factory.createIdentifier(local);
			}

			// If the namespace is already imported, get the local binding name for it and create an identifier for it
			// rather than generating a new unnecessary import
			else if (!moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
				const local = context.getLocalForNamespaceImportFromModule(moduleSpecifier)!;
				return factory.createIdentifier(local);
			}

			// Otherwise proceed as planned
			else {
				const identifier = factory.createIdentifier(context.getFreeIdentifier(generateNameFromModuleSpecifier(moduleSpecifier)));
				context.addImport(
					factory.createImportDeclaration(
						undefined,
						undefined,

						moduleExports.hasDefaultExport
							? // Import the default if it has any (or if we don't know if it has)
							  factory.createImportClause(false, identifier, undefined)
							: // Otherwise, import the entire namespace
							  factory.createImportClause(false, undefined, factory.createNamespaceImport(identifier)),
						factory.createStringLiteral(transformedModuleSpecifier)
					),
					moduleSpecifier
				);
				return identifier;
			}
		}

		// If the VariableDeclaration is a BindingPattern, it may mimic destructuring specific named exports.
		// For example, 'const {foo, bar} = require("./bar")' could import the named export bindings 'foo' and 'bar' from the module './bar'.
		// However, if as much as a single one of these elements don't directly match a named export, opt out of this behavior and instead
		// import the default export (if it has any, otherwise import the entire namespace).
		else if (typescript.isObjectBindingPattern(variableDeclarationParent.name)) {
			const importSpecifiers: TS.ImportSpecifier[] = [];
			const skippedImportSpecifiers: TS.ImportSpecifier[] = [];

			// Check each of the BindingElements
			for (const element of variableDeclarationParent.name.elements) {
				// If the property name isn't given, the name will always be an Identifier
				if (element.propertyName == null && typescript.isIdentifier(element.name)) {
					// If the module exports contains a named export matching the identifier name,
					// use that as an ImportSpecifier
					if (moduleExports.namedExports.has(element.name.text)) {
						// If the property has already been imported, don't add an import, but instead push to 'skippedImportSpecifiers'.
						if (context.hasLocalForNamedImportPropertyNameFromModule(element.name.text, moduleSpecifier)) {
							const local = context.getLocalForNamedImportPropertyNameFromModule(element.name.text, moduleSpecifier)!;
							skippedImportSpecifiers.push(
								local === element.name.text
									? factory.createImportSpecifier(false, undefined, factory.createIdentifier(local))
									: factory.createImportSpecifier(false, factory.createIdentifier(element.name.text), factory.createIdentifier(local))
							);
						}

						// If the name is free, just import it as it is
						else if (context.isIdentifierFree(element.name.text)) {
							context.addLocal(element.name.text);
							importSpecifiers.push(factory.createImportSpecifier(false, undefined, factory.createIdentifier(element.name.text)));
						} else {
							// Otherwise, import it under an aliased name
							const alias = context.getFreeIdentifier(element.name.text);
							importSpecifiers.push(factory.createImportSpecifier(false, factory.createIdentifier(element.name.text), factory.createIdentifier(alias)));
						}
					}
				}

				// Otherwise, if it has a PropertyName,
				// It may be something like for example: '{foo: bar}' where 'foo' is the PropertyName and 'bar' is the name.
				// Of course it can get wilder than that, but for it to mimic ESM, we'll use at most the '{<propertyName>: <name>}' form
				// and preserve the remaining BindingName.
				// Since the ':bar' assignment comes from the VariableDeclaration that surrounds this CallExpression, we'll only
				// need to import the actual named export without considering the alias
				else if (element.propertyName != null && typescript.isIdentifier(element.propertyName)) {
					// If the name is free, just import it as it is
					if (context.isIdentifierFree(element.propertyName.text)) {
						context.addLocal(element.propertyName.text);
						importSpecifiers.push(factory.createImportSpecifier(false, undefined, factory.createIdentifier(element.propertyName.text)));
					} else {
						const alias = context.getFreeIdentifier(element.propertyName.text);
						importSpecifiers.push(factory.createImportSpecifier(false, factory.createIdentifier(element.propertyName.text), factory.createIdentifier(alias)));
					}
				}
			}

			// If there aren't as many ImportSpecifiers as there are elements, opt out of this behavior and instead
			// import the default export (if it has any, otherwise import the entire namespace).
			if (importSpecifiers.length + skippedImportSpecifiers.length !== variableDeclarationParent.name.elements.length) {
				// If the default export is already imported, get the local binding name for it and create an identifier for it
				// rather than generating a new unnecessary import
				if (moduleExports.hasDefaultExport && context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
					const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!;
					return factory.createIdentifier(local);
				}

				// If the namespace is already imported, get the local binding name for it and create an identifier for it
				// rather than generating a new unnecessary import
				else if (!moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
					const local = context.getLocalForNamespaceImportFromModule(moduleSpecifier)!;
					return factory.createIdentifier(local);
				}

				// Otherwise proceed as planned
				else {
					const identifier = factory.createIdentifier(context.getFreeIdentifier(generateNameFromModuleSpecifier(moduleSpecifier)));
					context.addImport(
						factory.createImportDeclaration(
							undefined,
							undefined,

							moduleExports.hasDefaultExport
								? // Import the default if it has any (or if we don't know if it has)
								  factory.createImportClause(false, identifier, undefined)
								: // Otherwise, import the entire namespace
								  factory.createImportClause(false, undefined, factory.createNamespaceImport(identifier)),
							factory.createStringLiteral(transformedModuleSpecifier)
						),
						moduleSpecifier
					);
					return identifier;
				}
			}

			// Otherwise, add an import for those specific, optionally aliased, named exports
			// and then replace this CallExpression with an Object literal that can be destructured
			else {
				if (importSpecifiers.length > 0) {
					context.addImport(
						factory.createImportDeclaration(
							undefined,
							undefined,
							factory.createImportClause(false, undefined, factory.createNamedImports(importSpecifiers)),
							factory.createStringLiteral(transformedModuleSpecifier)
						),
						moduleSpecifier
					);
				}

				const objectLiteralProperties = [...importSpecifiers, ...skippedImportSpecifiers].map(specifier =>
					specifier.propertyName != null
						? factory.createPropertyAssignment(specifier.propertyName.text, factory.createIdentifier(specifier.name.text))
						: factory.createShorthandPropertyAssignment(factory.createIdentifier(specifier.name.text))
				);
				return factory.createObjectLiteralExpression(objectLiteralProperties);
			}
		}
	}

	// Find the first BinaryExpression with an equals token that holds the require(...) call on the right side, and a PropertyAccessExpression or ElementAccessExpression on the left side, if any.
	// For example, 'exports.foo = require(...)'
	const binaryExpressionParent = findNodeUp(node, typescript.isBinaryExpression, nextNode => isStatement(nextNode, typescript));

	if (
		binaryExpressionParent != null &&
		binaryExpressionParent.operatorToken.kind === typescript.SyntaxKind.EqualsToken &&
		(typescript.isPropertyAccessExpression(walkThroughFillerNodes(binaryExpressionParent.left, typescript)) ||
			typescript.isElementAccessExpression(walkThroughFillerNodes(binaryExpressionParent.left, typescript)))
	) {
		// Simply add an import for the default export - if it has any (otherwise we'll import the entire namespace), and
		// replace this CallExpression by an identifier for it
		// If the default export is already imported, get the local binding name for it and create an identifier for it
		// rather than generating a new unnecessary import
		if (moduleExports.hasDefaultExport && context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
			const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!;
			return factory.createIdentifier(local);
		}

		// If the namespace is already imported, get the local binding name for it and create an identifier for it
		// rather than generating a new unnecessary import
		else if (!moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
			const local = context.getLocalForNamespaceImportFromModule(moduleSpecifier)!;
			return factory.createIdentifier(local);
		}

		// Otherwise proceed as planned
		else {
			const identifier = factory.createIdentifier(context.getFreeIdentifier(generateNameFromModuleSpecifier(moduleSpecifier)));
			context.addImport(
				factory.createImportDeclaration(
					undefined,
					undefined,

					moduleExports.hasDefaultExport
						? // Import the default if it has any (or if we don't know if it has)
						  factory.createImportClause(false, identifier, undefined)
						: // Otherwise, import the entire namespace
						  factory.createImportClause(false, undefined, factory.createNamespaceImport(identifier)),
					factory.createStringLiteral(transformedModuleSpecifier)
				),
				moduleSpecifier
			);
			return identifier;
		}
	}

	// Otherwise, check if the require(...) call is part of another CallExpression.
	// For example: 'myFunction(require(...)' or 'require(...)(...)'
	const callExpressionParent = findNodeUp(node, typescript.isCallExpression, nextNode => isStatementOrDeclaration(nextNode, typescript));

	// If it is wrapped in a CallExpression, import the default export if it has any (otherwise the entire namespace)
	// and replace the require() call by an identifier for it
	if (callExpressionParent != null) {
		// If the default export is already imported, get the local binding name for it and create an identifier for it
		// rather than generating a new unnecessary import
		if (moduleExports.hasDefaultExport && context.hasLocalForDefaultImportFromModule(moduleSpecifier)) {
			const local = context.getLocalForDefaultImportFromModule(moduleSpecifier)!;
			return factory.createIdentifier(local);
		}

		// If the namespace is already imported, get the local binding name for it and create an identifier for it
		// rather than generating a new unnecessary import
		else if (!moduleExports.hasDefaultExport && context.hasLocalForNamespaceImportFromModule(moduleSpecifier)) {
			const local = context.getLocalForNamespaceImportFromModule(moduleSpecifier)!;
			return factory.createIdentifier(local);
		}

		// Otherwise, proceed as planned
		else {
			const identifier = factory.createIdentifier(context.getFreeIdentifier(generateNameFromModuleSpecifier(moduleSpecifier)));
			context.addImport(
				factory.createImportDeclaration(
					undefined,
					undefined,

					moduleExports.hasDefaultExport
						? // Import the default if it has any (or if we don't know if it has)
						  factory.createImportClause(false, identifier, undefined)
						: // Otherwise, import the entire namespace
						  factory.createImportClause(false, undefined, factory.createNamespaceImport(identifier)),
					factory.createStringLiteral(transformedModuleSpecifier)
				),
				moduleSpecifier
			);
			return identifier;
		}
	}

	if (shouldDebug(context.debug)) {
		throw new TypeError(`Could not handle require() call`);
	} else {
		return node;
	}
}
