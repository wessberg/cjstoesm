import type {BeforeVisitorOptions} from "../before-visitor-options.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";
import {visitExportAssignment} from "./visit-export-assignment.js";
import {isDeclaration} from "../../util/is-declaration.js";
import {getLocalsForBindingName} from "../../util/get-locals-for-binding-name.js";
import type {TS} from "../../../type/ts.js";
import {hasDefaultExportModifier, hasExportModifier} from "../../../shared/util/util.js";

/**
 * Visits the given Node
 *
 * @param options
 * @returns
 */
export function visitImportAndExportDeclarations<T extends TS.Node>(options: BeforeVisitorOptions<T>): TS.VisitResult<TS.Node | undefined> {
	const {typescript} = options.context;
	if (typescript.isImportDeclaration(options.node)) {
		return visitImportDeclaration(options as unknown as BeforeVisitorOptions<TS.ImportDeclaration>);
	} else if (typescript.isExportDeclaration(options.node)) {
		return visitExportDeclaration(options as unknown as BeforeVisitorOptions<TS.ExportDeclaration>);
	} else if (typescript.isExportAssignment(options.node)) {
		return visitExportAssignment(options as unknown as BeforeVisitorOptions<TS.ExportAssignment>);
	} else if (hasDefaultExportModifier(options.node, typescript)) {
		options.context.markDefaultAsExported();
	} else if (hasExportModifier(options.node, typescript)) {
		if (isDeclaration(options.node, typescript)) {
			const declarationName = typescript.getNameOfDeclaration(options.node);
			if (declarationName != null && typescript.isIdentifier(declarationName)) {
				options.context.markLocalAsExported(declarationName.text);
			}
		} else if (typescript.isVariableStatement(options.node)) {
			for (const declaration of options.node.declarationList.declarations) {
				for (const local of getLocalsForBindingName(declaration.name, typescript)) {
					options.context.markLocalAsExported(local);
				}
			}
		}
	}

	return options.childContinuation(options.node);
}
