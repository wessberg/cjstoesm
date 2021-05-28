import {BeforeVisitorOptions} from "../before-visitor-options";
import {TS} from "../../../type/ts";

/**
 * Visits the given ImportDeclaration
 */
export function visitImportDeclaration({node, context}: BeforeVisitorOptions<TS.ImportDeclaration>): TS.VisitResult<TS.Node> {
	context.addImport(node, true);
	return undefined;
}
