import {BeforeVisitorOptions} from "../before-visitor-options";
import {getExportsData} from "../../util/get-exports-data";
import {walkThroughFillerNodes} from "../../util/walk-through-filler-nodes";
import {isNamedDeclaration} from "../../util/is-named-declaration";
import {ensureNodeHasExportModifier} from "../../util/ensure-node-has-export-modifier";
import {nodeContainsSuper} from "../../util/node-contains-super";
import {addExportModifier} from "../../util/add-export-modifier";
import {isRequireCall} from "../../util/is-require-call";
import {getModuleExportsFromRequireDataInContext} from "../../util/get-module-exports-from-require-data-in-context";
import {isExpression} from "../../util/is-expression";
import {findNodeUp} from "../../util/find-node-up";
import {getLocalsForBindingName} from "../../util/get-locals-for-binding-name";
import {TS} from "../../../type/ts";
import {shouldDebug} from "../../util/should-debug";

/**
 * Visits the given BinaryExpression
 */
export function visitBinaryExpression({node, sourceFile, context, continuation}: BeforeVisitorOptions<TS.BinaryExpression>): TS.VisitResult<TS.Node> {
	// Check if the left-hand side contains exports. For example: 'exports = ...' or 'exports.foo = 1' or event 'module.exports = 1'
	const {typescript, factory} = context;
	const exportsData = getExportsData(node.left, context.exportsName, typescript);
	const right = walkThroughFillerNodes(node.right, typescript);
	if (exportsData == null) return node;

	// If it is an assignment
	if (node.operatorToken.kind === typescript.SyntaxKind.EqualsToken) {
		// Check if this expression is part of a VariableDeclaration.
		// For example: 'const foo = module.exports = ...'
		const variableDeclarationParent = findNodeUp(node, typescript.isVariableDeclaration);
		const variableDeclarationLocal =
			variableDeclarationParent != null ? factory.createIdentifier(getLocalsForBindingName(variableDeclarationParent.name, typescript)[0]) : undefined;

		// This is something like for example 'exports = ...', 'module.exports = ...', 'exports.default', or 'module.exports.default'
		if (exportsData.property == null || exportsData.property === "default") {
			// Take all individual key-value pairs of that ObjectLiteral
			// and turn them into named exports if possible.
			// Also generate a default export of the entire exports object
			if (typescript.isObjectLiteralExpression(right)) {
				// If it has no properties, or if the literal is exported as part of the right-hand side of the assignment for a VariableDeclaration, create a simple default export declaration
				if (right.properties.length === 0 || variableDeclarationLocal != null) {
					const continuationResult = continuation(node.right);

					if (continuationResult == null || Array.isArray(continuationResult) || !isExpression(continuationResult, typescript)) {
						return undefined;
					}

					const exportedSymbol = variableDeclarationLocal != null ? variableDeclarationLocal : continuationResult;

					// Only generate the default export if the module don't already include a default export
					if (!context.isDefaultExported) {
						context.markDefaultAsExported();
						context.addTrailingStatements(factory.createExportAssignment(undefined, undefined, false, exportedSymbol));
					}

					return variableDeclarationParent != null ? node.right : undefined;
				}

				const statements: TS.Statement[] = [];
				let moduleExportsIdentifierName: string | undefined;
				const elements: TS.ObjectLiteralElementLike[] = [];

				for (const property of right.properties) {
					const propertyName =
						property.name == null
							? undefined
							: typescript.isLiteralExpression(property.name) || typescript.isIdentifier(property.name) || typescript.isPrivateIdentifier(property.name)
							? property.name.text
							: typescript.isLiteralExpression(property.name.expression)
							? property.name.expression.text
							: undefined;

					// If no property name could be decided, or if the local is already exported, or if it is a setter, skip this property
					if (propertyName == null || typescript.isSetAccessorDeclaration(property) || typescript.isGetAccessorDeclaration(property) || context.isLocalExported(propertyName)) {
						elements.push(property);
						continue;
					}

					// If it is a Shorthand Property assignment, we know that it holds a reference to some root-level identifier.
					// Based on this knowledge, we can safely generate a proper ExportDeclaration for it
					if (typescript.isShorthandPropertyAssignment(property)) {
						context.markLocalAsExported(propertyName);

						elements.push(factory.createShorthandPropertyAssignment(propertyName, property.objectAssignmentInitializer));

						const namedExports = factory.createNamedExports([factory.createExportSpecifier(false, undefined, propertyName)]);
						statements.push(factory.createExportDeclaration(undefined, undefined, false, namedExports, undefined));
					}

					// If it is a PropertyAssignment that points to an Identifier, we know that it holds a reference to some root-level identifier.
					// Based on this knowledge, we can safely generate a proper ExportDeclaration for it
					else if (typescript.isPropertyAssignment(property) && typescript.isIdentifier(property.initializer)) {
						context.markLocalAsExported(propertyName);

						elements.push(factory.createPropertyAssignment(propertyName, factory.createIdentifier(property.initializer.text)));

						const namedExports = factory.createNamedExports([
							propertyName === property.initializer.text
								? factory.createExportSpecifier(false, undefined, propertyName)
								: factory.createExportSpecifier(false, property.initializer.text, propertyName)
						]);

						statements.push(factory.createExportDeclaration(undefined, undefined, false, namedExports, undefined));
					} else if (context.isIdentifierFree(propertyName) && typescript.isPropertyAssignment(property) && !nodeContainsSuper(property.initializer, typescript)) {
						context.addLocal(propertyName);
						elements.push(factory.createShorthandPropertyAssignment(propertyName));

						statements.push(
							factory.createVariableStatement(
								[factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
								factory.createVariableDeclarationList([factory.createVariableDeclaration(propertyName, undefined, undefined, property.initializer)], typescript.NodeFlags.Const)
							)
						);
					}

					// If it is a MethodDeclaration that can be safely rewritten to a function, do so
					else if (
						context.isIdentifierFree(propertyName) &&
						typescript.isMethodDeclaration(property) &&
						typescript.isIdentifier(property.name) &&
						!nodeContainsSuper(property, typescript)
					) {
						context.addLocal(propertyName);
						elements.push(factory.createShorthandPropertyAssignment(propertyName));

						statements.push(
							factory.createFunctionDeclaration(
								property.decorators,
								addExportModifier(property.modifiers, context),
								property.asteriskToken,
								property.name,
								property.typeParameters,
								property.parameters,
								property.type,
								property.body
							)
						);
					}

					// Otherwise, so long as the identifier of the property is free, generate a VariableStatement that exports
					// the binding as a named export
					else if (context.isIdentifierFree(propertyName)) {
						context.addLocal(propertyName);
						elements.push(property);
						if (moduleExportsIdentifierName == null) {
							moduleExportsIdentifierName = context.getFreeIdentifier("moduleExports");
						}

						context.markLocalAsExported(propertyName);
						statements.push(
							factory.createVariableStatement(
								[factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
								factory.createVariableDeclarationList(
									[
										factory.createVariableDeclaration(
											propertyName,
											undefined,
											undefined,
											factory.createPropertyAccessExpression(factory.createIdentifier(moduleExportsIdentifierName), propertyName)
										)
									],
									typescript.NodeFlags.Const
								)
							)
						);
					} else {
						elements.push(property);
					}
				}

				// If we need the default export the have a name such that it can be referenced in a later named export,
				// create a VariableStatement as well as an ExportAssignment that references it
				if (moduleExportsIdentifierName != null) {
					// Create a VariableStatement that exports the ObjectLiteral
					statements.push(
						factory.createVariableStatement(
							undefined,
							factory.createVariableDeclarationList(
								[factory.createVariableDeclaration(moduleExportsIdentifierName, undefined, undefined, factory.createObjectLiteralExpression(elements, true))],
								typescript.NodeFlags.Const
							)
						)
					);

					if (!context.isDefaultExported) {
						statements.push(factory.createExportAssignment(undefined, undefined, false, factory.createIdentifier(moduleExportsIdentifierName)));

						context.markDefaultAsExported();
					}
				}

				// Otherwise, we don't need to assign it to a VariableStatement. Instead, we can just provide the ObjectLiteralExpression to the ExportAssignment directly.
				else if (!context.isDefaultExported) {
					const defaultExportInitializer = factory.createObjectLiteralExpression(elements, true);
					statements.push(factory.createExportAssignment(undefined, undefined, false, defaultExportInitializer));
				}

				// Return all of the statements
				context.addTrailingStatements(...statements);
				return undefined;
			}

			// Convert it into an ExportAssignment instead if possible
			else {
				// Check if the rightvalue represents a require(...) call.
				const requireData = isRequireCall(node.right, sourceFile, context);

				// If it doesn't, export the right side
				if (!requireData.match) {
					if (!context.isDefaultExported) {
						context.markDefaultAsExported();
						const continuationResult = continuation(node.right);
						if (continuationResult == null || Array.isArray(continuationResult) || !isExpression(continuationResult, typescript)) {
							return undefined;
						} else {
							const replacementNode = variableDeclarationParent != null ? continuationResult : undefined;
							const exportedSymbol = variableDeclarationLocal != null ? variableDeclarationLocal : continuationResult;

							context.addTrailingStatements(factory.createExportAssignment(undefined, undefined, false, exportedSymbol));
							return replacementNode;
						}
					}
					return undefined;
				}

				// Otherwise, spread out the things we know about the require call
				const {moduleSpecifier} = requireData;

				// If no module specifier could be determined, there's nothing we can do
				if (moduleSpecifier == null) {
					if (shouldDebug(context.debug)) {
						throw new TypeError(`Could not handle re-export from require() call. The module specifier wasn't statically analyzable`);
					} else {
						return undefined;
					}
				}

				// Otherwise, take the exports from that module
				else {
					const moduleExports = getModuleExportsFromRequireDataInContext(requireData, context);
					const moduleSpecifierExpression = factory.createStringLiteral(moduleSpecifier);

					// If the module has a default export, or if we know nothing about it,
					// export the default export from that module
					if (!context.isDefaultExported && (moduleExports == null || moduleExports.hasDefaultExport)) {
						context.markDefaultAsExported();
						const namedExports = factory.createNamedExports([factory.createExportSpecifier(false, undefined, "default")]);
						context.addTrailingStatements(factory.createExportDeclaration(undefined, undefined, false, namedExports, moduleSpecifierExpression));
						return undefined;
					}

					// Otherwise, export the entire module (e.g. all named exports)
					else {
						context.addTrailingStatements(factory.createExportDeclaration(undefined, undefined, false, undefined, moduleSpecifierExpression));
						return undefined;
					}
				}
			}
		}

		// If this is part of a VariableDeclaration, such as for 'const foo = exports.bar = ...', it should be translated into:
		// const foo = ...;
		// export {foo as bar}
		else if (variableDeclarationLocal != null) {
			const local = exportsData.property;
			const continuationResult = continuation(node.right);

			if (continuationResult == null || Array.isArray(continuationResult) || (!isExpression(continuationResult, typescript) && !typescript.isIdentifier(continuationResult))) {
				return undefined;
			}

			const namedExports = factory.createNamedExports([
				local === variableDeclarationLocal.text
					? factory.createExportSpecifier(false, undefined, factory.createIdentifier(local))
					: factory.createExportSpecifier(false, variableDeclarationLocal.text, factory.createIdentifier(local))
			]);

			context.addTrailingStatements(factory.createExportDeclaration(undefined, undefined, false, namedExports));
			return continuationResult;
		}

		// If the right-hand side is an identifier, this can safely be converted into an ExportDeclaration
		// such as 'export {foo}'
		else if (typescript.isIdentifier(right)) {
			const local = exportsData.property;
			if (!context.isLocalExported(local)) {
				const namedExports = factory.createNamedExports([
					local === right.text
						? factory.createExportSpecifier(false, undefined, factory.createIdentifier(local))
						: factory.createExportSpecifier(false, right.text, factory.createIdentifier(local))
				]);
				context.markLocalAsExported(local);
				context.addTrailingStatements(factory.createExportDeclaration(undefined, undefined, false, namedExports));
			}
			return undefined;
		}

		// Otherwise, this is something like 'exports.foo = function foo () {}'
		else if (isNamedDeclaration(right, typescript) && right.name != null && typescript.isIdentifier(right.name) && exportsData.property === right.name.text) {
			context.addTrailingStatements(ensureNodeHasExportModifier(right, context) as unknown as TS.Statement);
			return undefined;
		}

		// Otherwise, this can be converted into a VariableStatement
		else {
			const continuationResult = continuation(node.right);

			if (continuationResult == null || Array.isArray(continuationResult)) {
				return undefined;
			}

			if (!context.isLocalExported(exportsData.property)) {
				context.markLocalAsExported(exportsData.property);

				if (typescript.isIdentifier(continuationResult)) {
					const namedExports = factory.createNamedExports([
						continuationResult.text === exportsData.property
							? factory.createExportSpecifier(false, undefined, factory.createIdentifier(exportsData.property))
							: factory.createExportSpecifier(false, factory.createIdentifier(continuationResult.text), factory.createIdentifier(exportsData.property))
					]);
					context.addTrailingStatements(factory.createExportDeclaration(undefined, undefined, false, namedExports, undefined));
				} else {
					const freeIdentifier = context.getFreeIdentifier(exportsData.property);

					// If it is free, we can simply add an export modifier in front of the expression
					if (freeIdentifier === exportsData.property) {
						context.addTrailingStatements(
							factory.createVariableStatement(
								[factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
								factory.createVariableDeclarationList(
									[factory.createVariableDeclaration(exportsData.property, undefined, undefined, continuationResult as TS.Expression)],
									typescript.NodeFlags.Const
								)
							)
						);
					} else {
						const namedExports = factory.createNamedExports([factory.createExportSpecifier(false, freeIdentifier, exportsData.property)]);

						// If it isn't, we'll need to bind it to a variable with the free name, but then export it under the original one
						context.addTrailingStatements(
							factory.createVariableStatement(
								undefined,
								factory.createVariableDeclarationList(
									[factory.createVariableDeclaration(freeIdentifier, undefined, undefined, continuationResult as TS.Expression)],
									typescript.NodeFlags.Const
								)
							),
							factory.createExportDeclaration(undefined, undefined, false, namedExports, undefined)
						);
					}
				}
			}
			return undefined;
		}
	}

	return node;
}
