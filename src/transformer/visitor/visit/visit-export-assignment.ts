import type {BeforeVisitorOptions} from "../before-visitor-options.js";
import type {TS} from "../../../type/ts.js";

/**
 * Visits the given ExportAssignment
 */
export function visitExportAssignment({context}: BeforeVisitorOptions<TS.ExportAssignment>): TS.VisitResult<TS.Node | undefined> {
	context.markDefaultAsExported();
	return undefined;
}
