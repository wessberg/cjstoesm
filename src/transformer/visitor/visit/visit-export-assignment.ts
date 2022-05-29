import {BeforeVisitorOptions} from "../before-visitor-options.js";
import {TS} from "../../../type/ts.js";

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
