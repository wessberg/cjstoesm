import {BeforeVisitorOptions} from "../before-visitor-options";
import {TS} from "../../../../type/type";

/**
 * Visits the given ImportDeclaration
 *
 * @param options
 * @returns
 */
export function visitImportDeclaration({node, context}: BeforeVisitorOptions<TS.ImportDeclaration>): TS.VisitResult<TS.Node> {
	context.addImport(node, true);
	return undefined;
}
