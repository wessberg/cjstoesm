import type {BeforeVisitorOptions} from "../before-visitor-options.js";
import type {TS} from "../../../type/ts.js";

/**
 * Visits the given ImportDeclaration
 */
export function visitImportDeclaration({node, context}: BeforeVisitorOptions<TS.ImportDeclaration>): TS.VisitResult<TS.Node | undefined> {
	if (!context.typescript.isStringLiteralLike(node.moduleSpecifier)) return undefined;

	context.addImport(node, node.moduleSpecifier.text, true);
	return undefined;
}
