import {TS} from "../../type/ts";

export function willReassignIdentifier(identifier: string, node: TS.Node, typescript: typeof TS): boolean {
	const result = typescript.forEachChild<boolean>(node, nextNode => {
		// If it is an assignment to the given identifier
		if (
			typescript.isBinaryExpression(nextNode) &&
			nextNode.operatorToken.kind === typescript.SyntaxKind.EqualsToken &&
			typescript.isIdentifier(nextNode.left) &&
			nextNode.left.text === identifier
		) {
			return true;
		}

		if (willReassignIdentifier(identifier, nextNode, typescript)) {
			return true;
		}

		return;
	});

	return result != null ? result : false;
}
