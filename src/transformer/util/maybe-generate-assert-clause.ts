import type {TS} from "../../type/ts.js";
import {VisitorContext} from "../visitor-context.js";

export function maybeGenerateAssertClause(context: VisitorContext, moduleSpecifier: string, assert?: string): TS.AssertClause | undefined {
	if (assert == null) return undefined;

	const {factory, importAssertions} = context;

	if (importAssertions === false || (typeof importAssertions === "function" && !importAssertions(moduleSpecifier))) {
		return undefined;
	}

	if (!("createAssertClause" in context.typescript.factory)) {
		context.logger.warn(
			`The current version of TypeScript (v${context.typescript.version}) does not support Import Assertions. No Import Assertion will be added for the module with specifier '${moduleSpecifier}' in the transformed code. To remove this warning, either disable import assertions or update to TypeScript v4.5 or newer.`
		);
	}

	return factory.createAssertClause(factory.createNodeArray([factory.createAssertEntry(factory.createIdentifier("type"), factory.createStringLiteral(assert))]));
}
