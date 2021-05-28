import {BeforeVisitorOptions} from "../before-visitor-options";
import {TS} from "../../../type/ts";

/**
 * Visits the given ExportDeclaration
 */
export function visitExportDeclaration({node, context}: BeforeVisitorOptions<TS.ExportDeclaration>): TS.VisitResult<TS.Node> {
	if (node.exportClause != null && context.typescript.isNamedExports(node.exportClause)) {
		for (const element of node.exportClause.elements) {
			// If the name is 'default' that name is considered special since it represents the default export
			// rather than a named export
			if (element.name.text === "default") {
				context.markDefaultAsExported();
			} else {
				// Mark the name as a named export. If the propertyName is different, that's fine
				// - we care about the exported binding name, nothing else
				context.markLocalAsExported(element.name.text);
			}
		}
	}
	return undefined;
}
