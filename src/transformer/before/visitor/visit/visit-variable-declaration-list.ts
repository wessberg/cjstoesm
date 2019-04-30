import {isVariableDeclarationList, Node, updateVariableDeclarationList, VariableDeclarationList, VisitResult} from "typescript";
import {BeforeVisitorOptions} from "../before-visitor-options";
import {isNotEmittedStatement} from "./is-not-emitted-statement";

/**
 * Visits the given VariableDeclarationList
 * @param {BeforeVisitorOptions<VariableDeclarationList>} options
 * @returns {VisitResult<VariableDeclarationList>}
 */
export function visitVariableDeclarationList({node, childContinuation, context}: BeforeVisitorOptions<VariableDeclarationList>): VisitResult<Node> {
	if (context.onlyExports) {
		return childContinuation(node);
	}

	const continuationResult = childContinuation(node);

	// If the result isn't a new VariableDeclarationList, return that result
	if (continuationResult == null || Array.isArray(continuationResult) || !isVariableDeclarationList(continuationResult)) return continuationResult;

	// Check if there are any VariableDeclarations left to be emitted
	const remainingDeclarations = continuationResult.declarations.filter(declaration => !isNotEmittedStatement(declaration));
	// If not, return the continuation result
	if (remainingDeclarations.length === 0) return continuationResult;

	// Otherwise, return an updated version of the declaration list, preserving only those declarations that should be emitted
	return updateVariableDeclarationList(node, remainingDeclarations);
}
