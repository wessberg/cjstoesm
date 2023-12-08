import {BeforeVisitorContext} from "../visitor/before-visitor-context.js";
import {TS} from "../../type/ts.js";
import {shouldDebug} from "./should-debug.js";
import { tsFactoryDecoratorsInterop } from './decorators-interop.js'

export function ensureNodeHasExportModifier<T extends TS.NamedDeclaration & (
	| { modifiers?: readonly TS.Modifier[] }
	| TS.FunctionDeclaration
	| TS.FunctionExpression
	| TS.ClassDeclaration
	| TS.ClassExpression
	| TS.VariableStatement
	| TS.EnumDeclaration
	| TS.InterfaceDeclaration
	| TS.TypeAliasDeclaration
)>(node: T, context: BeforeVisitorContext): T {
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
		return node;
	}

	const newModifiers = [
		...((node as {decorators?: TS.Decorator[]}).decorators ?? []),
		factory.createModifier(typescript.SyntaxKind.ExportKeyword),
		...(node.modifiers ?? []),
	];

	if (typescript.isFunctionDeclaration(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateFunctionDeclaration)(
			node,
			newModifiers,
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		) as T;
	} else if (typescript.isFunctionExpression(node)) {
		return factory.updateFunctionExpression(
			node,
			newModifiers as TS.Modifier[],
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body,
		) as T;
	} else if (typescript.isClassDeclaration(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateClassDeclaration)(
			node,
			newModifiers,
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members,
		) as T;
	} else if (typescript.isClassExpression(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateClassExpression)(
			node,
			newModifiers,
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members,
		) as T;
	} else if (typescript.isVariableStatement(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateVariableStatement)(
			node,
			newModifiers,
			node.declarationList,
		) as T;
	} else if (typescript.isEnumDeclaration(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateEnumDeclaration)(
			node,
			newModifiers,
			node.name,
			node.members,
		) as T;
	} else if (typescript.isInterfaceDeclaration(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateInterfaceDeclaration)(
			node,
			newModifiers,
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members,
		) as T;
	} else if (typescript.isTypeAliasDeclaration(node)) {
		return tsFactoryDecoratorsInterop(context, factory.updateTypeAliasDeclaration)(
			node,
			newModifiers,
			node.name,
			node.typeParameters,
			node.type,
		) as T;
	}

	// Only throw if debugging is active
	else if (shouldDebug(context.debug)) {
		throw new TypeError(`Could not handle Node of kind: ${typescript.SyntaxKind[node.kind]}`);
	} else {
		return node;
	}
}
