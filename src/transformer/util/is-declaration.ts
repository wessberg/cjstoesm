import {TS} from "../../type/type";

/**
 * Returns true if the given Node is a Declaration
 * Uses an internal non-exposed Typescript helper to decide whether or not the Node is an Expression
 */
export function isDeclaration(node: TS.Node, typescript: typeof TS): node is TS.Declaration {
	return ((typescript as unknown) as {isDeclaration(node: TS.Node): boolean}).isDeclaration(node);
}
