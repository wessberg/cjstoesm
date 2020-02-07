import {ExportAssignment, Node, VisitResult} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";

/**
 * Visits the given ExportAssignment
 *
 * @param options
 * @returns
 */
export function visitExportAssignment({context}: BeforeVisitorOptions<ExportAssignment>): VisitResult<Node> {
	context.markDefaultAsExported();
	return undefined;
}
