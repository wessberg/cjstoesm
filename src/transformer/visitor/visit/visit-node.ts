import {BeforeVisitorOptions} from "../before-visitor-options.js";
import {visitCallExpression} from "./visit-call-expression.js";
import {visitBinaryExpression} from "./visit-binary-expression.js";
import {visitVariableDeclaration} from "./visit-variable-declaration.js";
import {visitVariableDeclarationList} from "./visit-variable-declaration-list.js";
import {getBestBodyInScope} from "../../util/get-best-body-in-scope.js";
import {TS} from "../../../type/ts.js";

/**
 * Visits the given Node
 */
export function visitNode<T extends TS.Node>(options: BeforeVisitorOptions<T>): TS.VisitResult<TS.Node> {
	const {typescript} = options.context;
	const bestNode = getBestBodyInScope(options);
	if (bestNode != null && bestNode !== options.node) {
		return options.childContinuation(bestNode);
	}

	if (typescript.isVariableDeclarationList(options.node)) {
		return visitVariableDeclarationList(options as unknown as BeforeVisitorOptions<TS.VariableDeclarationList>);
	} else if (typescript.isVariableDeclaration(options.node)) {
		return visitVariableDeclaration(options as unknown as BeforeVisitorOptions<TS.VariableDeclaration>);
	} else if (typescript.isBinaryExpression(options.node)) {
		return visitBinaryExpression(options as unknown as BeforeVisitorOptions<TS.BinaryExpression>);
	} else if (typescript.isCallExpression(options.node)) {
		return visitCallExpression(options as unknown as BeforeVisitorOptions<TS.CallExpression>);
	}

	return options.childContinuation(options.node);
}
