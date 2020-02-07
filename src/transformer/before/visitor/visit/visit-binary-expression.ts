import {
	BinaryExpression,
	createExportAssignment,
	createExportDeclaration,
	createExportSpecifier,
	createFunctionDeclaration,
	createIdentifier,
	createModifier,
	createNamedExports,
	createObjectLiteral,
	createPropertyAccess,
	createPropertyAssignment,
	createShorthandPropertyAssignment,
	createStringLiteral,
	createVariableDeclaration,
	createVariableDeclarationList,
	createVariableStatement,
	isGetAccessorDeclaration,
	isIdentifier,
	isLiteralExpression,
	isMethodDeclaration,
	isObjectLiteralExpression,
	isPropertyAssignment,
	isSetAccessorDeclaration,
	isShorthandPropertyAssignment,
	isVariableDeclaration,
	Node,
	NodeFlags,
	ObjectLiteralElementLike,
	Statement,
	SyntaxKind,
	VisitResult
} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";
import {getExportsData} from "../../../util/get-exports-data";
import {walkThroughFillerNodes} from "../../../util/walk-through-filler-nodes";
import {isNamedDeclaration} from "../../../util/is-named-declaration";
import {ensureNodeHasExportModifier} from "../../../util/ensure-node-has-export-modifier";
import {nodeContainsSuper} from "../../../util/node-contains-super";
import {addExportModifier} from "../../../util/add-export-modifier";
import {isRequireCall} from "../../../util/is-require-call";
import {getModuleExportsFromRequireDataInContext} from "../../../util/get-module-exports-from-require-data-in-context";
import {isExpression} from "../../../util/is-expression";
import {findNodeUp} from "../../../util/find-node-up";
import {getLocalsForBindingName} from "../../../util/get-locals-for-binding-name";

/**
 * Visits the given BinaryExpression
 *
 * @param options
 * @returns
 */
export function visitBinaryExpression({node, sourceFile, context, continuation}: BeforeVisitorOptions<BinaryExpression>): VisitResult<Node> {
	// Check if the left-hand side contains exports. For example: 'exports = ...' or 'exports.foo = 1' or event 'module.exports = 1'
	const exportsData = getExportsData(node.left);
	const right = walkThroughFillerNodes(node.right);
	if (exportsData == null) return node;

	// If it is an assignment
	if (node.operatorToken.kind === SyntaxKind.EqualsToken) {
		// Check if this expression is part of a VariableDeclaration.
		// For example: 'const foo = module.exports = ...'
		const variableDeclarationParent = findNodeUp(node, isVariableDeclaration);
		const variableDeclarationLocal =
			variableDeclarationParent != null ? createIdentifier(getLocalsForBindingName(variableDeclarationParent.name)[0]) : undefined;

		// This is something like for example 'exports = ...', 'module.exports = ...', 'exports.default', or 'module.exports.default'
		if (exportsData.property == null || exportsData.property === "default") {
			// Take all individual key-value pairs of that ObjectLiteral
			// and turn them into named exports if possible.
			// Also generate a default export of the entire exports object
			if (isObjectLiteralExpression(right)) {
				// If it has no properties, or if the literal is exported as part of the right-hand side of the assignment for a VariableDeclaration, create a simple default export declaration
				if (right.properties.length === 0 || variableDeclarationLocal != null) {
					const continuationResult = continuation(node.right);

					if (continuationResult == null || Array.isArray(continuationResult) || !isExpression(continuationResult)) {
						return undefined;
					}

					const exportedSymbol = variableDeclarationLocal != null ? variableDeclarationLocal : continuationResult;

					// Only generate the default export if the module don't already include a default export
					if (!context.isDefaultExported) {
						context.markDefaultAsExported();
						context.addTrailingStatements(createExportAssignment(undefined, undefined, false, exportedSymbol));
					}

					return variableDeclarationParent != null ? node.right : undefined;
				}

				const statements: Statement[] = [];
				let moduleExportsIdentifierName: string | undefined;
				const elements: ObjectLiteralElementLike[] = [];

				for (const property of right.properties) {
					const propertyName =
						property.name == null
							? undefined
							: isLiteralExpression(property.name) || isIdentifier(property.name)
							? property.name.text
							: isLiteralExpression(property.name.expression)
							? property.name.expression.text
							: undefined;

					// If no property name could be decided, or if the local is already exported, or if it is a setter, skip this property
					if (
						propertyName == null ||
						isSetAccessorDeclaration(property) ||
						isGetAccessorDeclaration(property) ||
						context.isLocalExported(propertyName)
					) {
						elements.push(property);
						continue;
					}

					// If it is a Shorthand Property assignment, we know that it holds a reference to some root-level identifier.
					// Based on this knowledge, we can safely generate a proper ExportDeclaration for it
					if (isShorthandPropertyAssignment(property)) {
						context.markLocalAsExported(propertyName);

						elements.push(createShorthandPropertyAssignment(propertyName, property.objectAssignmentInitializer));

						statements.push(createExportDeclaration(undefined, undefined, createNamedExports([createExportSpecifier(undefined, propertyName)])));
					}

					// If it is a PropertyAssignment that points to an Identifier, we know that it holds a reference to some root-level identifier.
					// Based on this knowledge, we can safely generate a proper ExportDeclaration for it
					else if (isPropertyAssignment(property) && isIdentifier(property.initializer)) {
						context.markLocalAsExported(propertyName);

						elements.push(createPropertyAssignment(propertyName, createIdentifier(property.initializer.text)));

						statements.push(
							createExportDeclaration(
								undefined,
								undefined,
								createNamedExports([
									propertyName === property.initializer.text
										? createExportSpecifier(undefined, propertyName)
										: createExportSpecifier(property.initializer.text, propertyName)
								])
							)
						);
					} else if (context.isIdentifierFree(propertyName) && isPropertyAssignment(property) && !nodeContainsSuper(property.initializer)) {
						elements.push(createShorthandPropertyAssignment(propertyName));

						statements.push(
							createVariableStatement(
								[createModifier(SyntaxKind.ExportKeyword)],
								createVariableDeclarationList([createVariableDeclaration(propertyName, undefined, property.initializer)], NodeFlags.Const)
							)
						);
					}

					// If it is a MethodDeclaration that can be safely rewritten to a function, do so
					else if (
						context.isIdentifierFree(propertyName) &&
						isMethodDeclaration(property) &&
						isIdentifier(property.name) &&
						!nodeContainsSuper(property)
					) {
						elements.push(createShorthandPropertyAssignment(propertyName));

						statements.push(
							createFunctionDeclaration(
								property.decorators,
								addExportModifier(property.modifiers),
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
						elements.push(property);
						if (moduleExportsIdentifierName == null) {
							moduleExportsIdentifierName = context.getFreeIdentifier("moduleExports");
						}

						context.markLocalAsExported(propertyName);
						statements.push(
							createVariableStatement(
								[createModifier(SyntaxKind.ExportKeyword)],
								createVariableDeclarationList(
									[
										createVariableDeclaration(
											propertyName,
											undefined,
											createPropertyAccess(createIdentifier(moduleExportsIdentifierName), propertyName)
										)
									],
									NodeFlags.Const
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
						createVariableStatement(
							undefined,
							createVariableDeclarationList(
								[createVariableDeclaration(moduleExportsIdentifierName, undefined, createObjectLiteral(elements, true))],
								NodeFlags.Const
							)
						)
					);

					if (!context.isDefaultExported) {
						statements.push(createExportAssignment(undefined, undefined, false, createIdentifier(moduleExportsIdentifierName)));

						context.markDefaultAsExported();
					}
				}

				// Otherwise, we don't need to assign it to a VariableStatement. Instead, we can just provide the ObjectLiteralExpression to the ExportAssignment directly.
				else if (!context.isDefaultExported) {
					const defaultExportInitializer = createObjectLiteral(elements, true);
					statements.push(createExportAssignment(undefined, undefined, false, defaultExportInitializer));
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
						if (continuationResult == null || Array.isArray(continuationResult) || !isExpression(continuationResult)) {
							return undefined;
						} else {
							const replacementNode = variableDeclarationParent != null ? continuationResult : undefined;
							const exportedSymbol = variableDeclarationLocal != null ? variableDeclarationLocal : continuationResult;

							context.addTrailingStatements(createExportAssignment(undefined, undefined, false, exportedSymbol));
							return replacementNode;
						}
					}
					return undefined;
				}

				// Otherwise, spread out the things we know about the require call
				const {moduleSpecifier} = requireData;

				// If no module specifier could be determined, there's nothing we can do
				if (moduleSpecifier == null) {
					if (context.debug) {
						throw new TypeError(`Could not handle re-export from require() call. The module specifier wasn't statically analyzable`);
					} else {
						return undefined;
					}
				}

				// Otherwise, take the exports from that module
				else {
					const moduleExports = getModuleExportsFromRequireDataInContext(requireData, context);
					// If the module has a default export, or if we know nothing about it,
					// export the default export from that module
					if (!context.isDefaultExported && (moduleExports == null || moduleExports.hasDefaultExport)) {
						context.markDefaultAsExported();
						context.addTrailingStatements(
							createExportDeclaration(
								undefined,
								undefined,
								createNamedExports([createExportSpecifier(undefined, "default")]),
								createStringLiteral(moduleSpecifier)
							)
						);
						return undefined;
					}

					// Otherwise, export the entire module (e.g. all named exports)
					else {
						context.addTrailingStatements(createExportDeclaration(undefined, undefined, undefined, createStringLiteral(moduleSpecifier)));
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

			if (continuationResult == null || Array.isArray(continuationResult) || !isExpression(continuationResult)) {
				return undefined;
			}

			context.addTrailingStatements(
				createExportDeclaration(
					undefined,
					undefined,
					createNamedExports([
						local === variableDeclarationLocal.text
							? createExportSpecifier(undefined, createIdentifier(local))
							: createExportSpecifier(variableDeclarationLocal.text, createIdentifier(local))
					])
				)
			);
			return continuationResult;
		}

		// If the right-hand side is an identifier, this can safely be converted into an ExportDeclaration
		// such as 'export {foo}'
		else if (isIdentifier(right)) {
			const local = exportsData.property;
			if (!context.isLocalExported(local)) {
				context.markLocalAsExported(local);
				context.addTrailingStatements(
					createExportDeclaration(
						undefined,
						undefined,
						createNamedExports([
							local === right.text
								? createExportSpecifier(undefined, createIdentifier(local))
								: createExportSpecifier(right.text, createIdentifier(local))
						])
					)
				);
			}
			return undefined;
		}

		// Otherwise, this is something like 'exports.foo = function () {}'
		else if (isNamedDeclaration(right)) {
			context.addTrailingStatements((ensureNodeHasExportModifier(right, context) as unknown) as Statement);
			return undefined;
		}

		// Otherwise, this can be converted into a VariableStatement
		else {
			if (!context.isLocalExported(exportsData.property)) {
				context.markLocalAsExported(exportsData.property);
				context.addTrailingStatements(
					createVariableStatement(
						[createModifier(SyntaxKind.ExportKeyword)],
						createVariableDeclarationList([createVariableDeclaration(exportsData.property, undefined, right)], NodeFlags.Const)
					)
				);
			}
			return undefined;
		}
	}

	return node;
}
