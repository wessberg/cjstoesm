import {TS} from "../../../../type/type";

export function isNotEmittedStatement(node: TS.Node, typescript: typeof TS): node is TS.NotEmittedStatement {
	return node.kind === typescript.SyntaxKind.NotEmittedStatement;
}
