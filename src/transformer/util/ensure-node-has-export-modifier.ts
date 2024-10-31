import type {BeforeVisitorContext} from "../visitor/before-visitor-context.js";
import type {TS} from "../../type/ts.js";
import {addExportModifier, canHaveModifiers, hasExportModifier} from "../../shared/util/util.js";

export function ensureNodeHasExportModifier<T extends TS.NamedDeclaration>(node: T, context: BeforeVisitorContext): T {
	const {typescript, factory} = context;

	const declarationName = typescript.getNameOfDeclaration(node);
	if (declarationName != null && typescript.isIdentifier(declarationName)) {
		// If the declaration name is part of the exports of the SourceFile, return the node as it is
		if (context.isLocalExported(declarationName.text)) {
			return node;
		}

		context.markLocalAsExported(declarationName.text);
	}

	// If the node already has an Export modifier, or if it wouldn't support such a modifier anyway, there's nothing to do
	if (hasExportModifier(node, typescript) || !canHaveModifiers(node, typescript)) {
		return node;
	}

	const newModifiers = addExportModifier(node, typescript, factory);

	return context.factory.replaceModifiers(
		node,
		newModifiers.filter(modifier => typescript.isModifier(modifier))
	);
}
