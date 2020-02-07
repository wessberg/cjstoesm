import {
	ExportAssignment,
	ExportDeclaration,
	getNameOfDeclaration,
	ImportDeclaration,
	isExportAssignment,
	isExportDeclaration,
	isIdentifier,
	isImportDeclaration,
	isVariableStatement,
	Node,
	VisitResult
} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitExportAssignment} from "./visit-export-assignment";
import {hasExportModifier} from "../../../util/has-export-modifier";
import {hasDefaultExportModifier} from "../../../util/has-default-export-modifier";
import {isDeclaration} from "../../../util/is-declaration";
import {getLocalsForBindingName} from "../../../util/get-locals-for-binding-name";

/**
 * Visits the given Node
 *
 * @param options
 * @returns
 */
export function visitImportAndExportDeclarations<T extends Node>(options: BeforeVisitorOptions<T>): VisitResult<Node> {
	if (isImportDeclaration(options.node)) {
		return visitImportDeclaration((options as unknown) as BeforeVisitorOptions<ImportDeclaration>);
	} else if (isExportDeclaration(options.node)) {
		return visitExportDeclaration((options as unknown) as BeforeVisitorOptions<ExportDeclaration>);
	} else if (isExportAssignment(options.node)) {
		return visitExportAssignment((options as unknown) as BeforeVisitorOptions<ExportAssignment>);
	} else if (hasDefaultExportModifier(options.node)) {
		options.context.markDefaultAsExported();
	} else if (hasExportModifier(options.node)) {
		if (isDeclaration(options.node)) {
			const declarationName = getNameOfDeclaration(options.node);
			if (declarationName != null && isIdentifier(declarationName)) {
				options.context.markLocalAsExported(declarationName.text);
			}
		} else if (isVariableStatement(options.node)) {
			for (const declaration of options.node.declarationList.declarations) {
				for (const local of getLocalsForBindingName(declaration.name)) {
					options.context.markLocalAsExported(local);
				}
			}
		}
	}

	return options.childContinuation(options.node);
}
