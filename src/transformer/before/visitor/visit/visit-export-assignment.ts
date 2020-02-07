import {BeforeVisitorOptions} from "../before-visitor-options";
import {TS} from "../../../../type/type";

/**
 * Visits the given ExportAssignment
 *
 * @param options
 * @returns
 */
export function visitExportAssignment({context}: BeforeVisitorOptions<TS.ExportAssignment>): TS.VisitResult<TS.Node> {
	context.markDefaultAsExported();
	return undefined;
}
