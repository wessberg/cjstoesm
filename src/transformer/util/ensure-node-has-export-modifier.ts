import {BeforeVisitorContext} from "../visitor/before-visitor-context.js";
import {TS} from "../../type/ts.js";
import {shouldDebug} from "./should-debug.js";

export function ensureNodeHasExportModifier<T extends TS.NamedDeclaration>(node: T, context: BeforeVisitorContext): T {
	const existingModifierKinds = node.modifiers == null ? [] : node.modifiers.map(m => m.kind);
	const {typescript, factory} = context;
	const declarationName = typescript.getNameOfDeclaration(node);
	if (declarationName != null && typescript.isIdentifier(declarationName)) {
		// If the declaration name is part of the exports of the SourceFile, return the node as it is
		if (context.isLocalExported(declarationName.text)) {
			return node;
		}

		context.markLocalAsExported(declarationName.text);
	}

	// If the node already has an Export modifier, there's nothing to do
	if (existingModifierKinds.includes(typescript.SyntaxKind.ExportKeyword)) {
		return node as unknown as T;
	}

	const newModifiers = [context.factory.createModifier(typescript.SyntaxKind.ExportKeyword), ...existingModifierKinds.map(kind => factory.createModifier(kind) as TS.Modifier)];

	if (typescript.isFunctionDeclaration(node)) {
		return context.factory.updateFunctionDeclaration(
			node,
			node.decorators,
			newModifiers,
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		) as unknown as T;
	} else if (typescript.isFunctionExpression(node)) {
		return context.factory.updateFunctionExpression(node, newModifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body) as unknown as T;
	} else if (typescript.isClassDeclaration(node)) {
		return context.factory.updateClassDeclaration(node, node.decorators, newModifiers, node.name, node.typeParameters, node.heritageClauses, node.members) as unknown as T;
	} else if (typescript.isClassExpression(node)) {
		return context.factory.updateClassExpression(node, node.decorators, newModifiers, node.name, node.typeParameters, node.heritageClauses, node.members) as unknown as T;
	} else if (typescript.isVariableStatement(node)) {
		return context.factory.updateVariableStatement(node, newModifiers, node.declarationList) as unknown as T;
	} else if (typescript.isEnumDeclaration(node)) {
		return context.factory.updateEnumDeclaration(node, node.decorators, newModifiers, node.name, node.members) as unknown as T;
	} else if (typescript.isInterfaceDeclaration(node)) {
		return context.factory.updateInterfaceDeclaration(node, node.decorators, newModifiers, node.name, node.typeParameters, node.heritageClauses, node.members) as unknown as T;
	} else if (typescript.isTypeAliasDeclaration(node)) {
		return context.factory.updateTypeAliasDeclaration(node, node.decorators, newModifiers, node.name, node.typeParameters, node.type) as unknown as T;
	}

	// Only throw if debugging is active
	else if (shouldDebug(context.debug)) {
		throw new TypeError(`Could not handle Node of kind: ${typescript.SyntaxKind[node.kind]}`);
	} else {
		return node;
	}
}
