import {BeforeVisitorOptions} from "../before-visitor-options";
import {isNotEmittedStatement} from "./is-not-emitted-statement";
import {TS} from "../../../../type/type";

/**
 * Visits the given VariableDeclarationList
 */
export function visitVariableDeclarationList({node, childContinuation, context}: BeforeVisitorOptions<TS.VariableDeclarationList>): TS.VisitResult<TS.Node> {
	if (context.onlyExports) {
		return childContinuation(node);
	}

	const {typescript} = context;
	const continuationResult = childContinuation(node);

	// If the result isn't a new VariableDeclarationList, return that result
	if (continuationResult == null || Array.isArray(continuationResult) || !typescript.isVariableDeclarationList(continuationResult)) {
		return continuationResult;
	}

	// Check if there are any VariableDeclarations left to be emitted
	const remainingDeclarations = continuationResult.declarations.filter(declaration => !isNotEmittedStatement(declaration, typescript));
	// If not, return the continuation result
	if (remainingDeclarations.length === 0) return continuationResult;

	// Otherwise, return an updated version of the declaration list, preserving only those declarations that should be emitted
	return typescript.updateVariableDeclarationList(node, remainingDeclarations);
}
