import type {TS} from "../../type/ts.js";
import type {VisitorContext} from "../visitor-context.js";

export function maybeGenerateImportAttributes(context: VisitorContext, moduleSpecifier: string, withValue?: string): TS.ImportAttributes | undefined {
	if (withValue == null) return undefined;

	const {factory, importAttributes} = context;

	if (importAttributes === false || (typeof importAttributes === "function" && !importAttributes(moduleSpecifier))) {
		return undefined;
	}

	// Note: We purposefully check on typescript.factory instead of context.factory, because we
	// want to check if the original NodeFactory - not the compatfactory - supports Import Attributes
	if (!("createImportAttributes" in context.typescript.factory)) {
		context.logger.warn(
			`The current version of TypeScript (v${context.typescript.version}) does not support Import Attributes. No Import Attributes will be added for the module with specifier '${moduleSpecifier}' in the transformed code. To remove this warning, either disable import attributes or update to TypeScript v5.3 or newer.`
		);
	}

	return factory.createImportAttributes(factory.createNodeArray([factory.createImportAttribute(factory.createIdentifier("type"), factory.createStringLiteral(withValue))]));
}
