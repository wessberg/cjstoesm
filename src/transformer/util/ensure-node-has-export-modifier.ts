import {
	createModifier,
	getNameOfDeclaration,
	isClassDeclaration,
	isClassExpression,
	isEnumDeclaration,
	isFunctionDeclaration,
	isFunctionExpression,
	isIdentifier,
	isInterfaceDeclaration,
	isTypeAliasDeclaration,
	isVariableStatement,
	Modifier,
	NamedDeclaration,
	SyntaxKind,
	updateClassDeclaration,
	updateClassExpression,
	updateEnumDeclaration,
	updateFunctionDeclaration,
	updateFunctionExpression,
	updateInterfaceDeclaration,
	updateTypeAliasDeclaration,
	updateVariableStatement
} from "typescript";
import {BeforeVisitorContext} from "../before/visitor/before-visitor-context";

export function ensureNodeHasExportModifier<T extends NamedDeclaration>(node: T, context: BeforeVisitorContext): T {
	const existingModifierKinds = node.modifiers == null ? [] : node.modifiers.map(m => m.kind);
	const declarationName = getNameOfDeclaration(node);
	if (declarationName != null && isIdentifier(declarationName)) {
		// If the declaration name is part of the exports of the SourceFile, return the node as it is
		if (context.isLocalExported(declarationName.text)) {
			return node;
		}

		context.markLocalAsExported(declarationName.text);
	}

	// If the node already has an Export modifier, there's nothing to do
	if (existingModifierKinds.includes(SyntaxKind.ExportKeyword)) {
		return (node as unknown) as T;
	}

	const newModifiers = [createModifier(SyntaxKind.ExportKeyword), ...existingModifierKinds.map(kind => createModifier(kind) as Modifier)];

	if (isFunctionDeclaration(node)) {
		return (updateFunctionDeclaration(node, node.decorators, newModifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body) as unknown) as T;
	} else if (isFunctionExpression(node)) {
		return (updateFunctionExpression(node, newModifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body) as unknown) as T;
	} else if (isClassDeclaration(node)) {
		return (updateClassDeclaration(node, node.decorators, newModifiers, node.name, node.typeParameters, node.heritageClauses, node.members) as unknown) as T;
	} else if (isClassExpression(node)) {
		return (updateClassExpression(node, newModifiers, node.name, node.typeParameters, node.heritageClauses, node.members) as unknown) as T;
	} else if (isVariableStatement(node)) {
		return (updateVariableStatement(node, newModifiers, node.declarationList) as unknown) as T;
	} else if (isEnumDeclaration(node)) {
		return (updateEnumDeclaration(node, node.decorators, newModifiers, node.name, node.members) as unknown) as T;
	} else if (isInterfaceDeclaration(node)) {
		return (updateInterfaceDeclaration(node, node.decorators, newModifiers, node.name, node.typeParameters, node.heritageClauses, node.members) as unknown) as T;
	} else if (isTypeAliasDeclaration(node)) {
		return (updateTypeAliasDeclaration(node, node.decorators, newModifiers, node.name, node.typeParameters, node.type) as unknown) as T;
	}

	// Only throw if debugging is active
	else if (context.debug) {
		throw new TypeError(`Could not handle Node of kind: ${SyntaxKind[node.kind]}`);
	} else {
		return node;
	}
}
