import {ImportDeclaration, Node, VisitResult} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";

/**
 * Visits the given ImportDeclaration
 * @param {BeforeVisitorOptions<ImportDeclaration>} options
 * @returns {VisitResult<ImportDeclaration>}
 */
export function visitImportDeclaration({node, context}: BeforeVisitorOptions<ImportDeclaration>): VisitResult<Node> {
	context.addImport(node, true);
	return undefined;
}
