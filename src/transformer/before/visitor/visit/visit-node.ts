import {
	BinaryExpression,
	CallExpression,
	isBinaryExpression,
	isCallExpression,
	isVariableDeclaration,
	isVariableDeclarationList,
	Node,
	VariableDeclaration,
	VariableDeclarationList,
	VisitResult
} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";
import {visitCallExpression} from "./visit-call-expression";
import {visitBinaryExpression} from "./visit-binary-expression";
import {visitVariableDeclaration} from "./visit-variable-declaration";
import {visitVariableDeclarationList} from "./visit-variable-declaration-list";

/**
 * Visits the given Node
 * @param {BeforeVisitorOptions<T>} options
 * @returns {VisitResult<T>}
 */
export function visitNode<T extends Node>(options: BeforeVisitorOptions<T>): VisitResult<Node> {
	if (isVariableDeclarationList(options.node)) {
		return visitVariableDeclarationList((options as unknown) as BeforeVisitorOptions<VariableDeclarationList>);
	} else if (isVariableDeclaration(options.node)) {
		return visitVariableDeclaration((options as unknown) as BeforeVisitorOptions<VariableDeclaration>);
	} else if (isBinaryExpression(options.node)) {
		return visitBinaryExpression((options as unknown) as BeforeVisitorOptions<BinaryExpression>);
	} else if (isCallExpression(options.node)) {
		return visitCallExpression((options as unknown) as BeforeVisitorOptions<CallExpression>);
	}

	return options.childContinuation(options.node);
}
