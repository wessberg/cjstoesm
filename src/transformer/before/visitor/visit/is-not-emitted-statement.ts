import {Node, NotEmittedStatement, SyntaxKind} from "typescript";

export function isNotEmittedStatement(node: Node): node is NotEmittedStatement {
	return node.kind === SyntaxKind.NotEmittedStatement;
}
