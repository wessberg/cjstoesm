import {Node} from "typescript";

export function findNodeUp<T extends Node>(from: Node, nodeCb: (node: Node) => node is T, breakWhen?: (node: Node) => boolean): T | undefined;
export function findNodeUp<T extends Node>(from: Node, nodeCb: (node: Node) => boolean, breakWhen?: (node: Node) => boolean): T | undefined;
export function findNodeUp<T extends Node>(from: Node, nodeCb: (node: Node) => boolean, breakWhen?: (node: Node) => boolean): T | undefined {
	let current = from as Node | T;
	while (current.parent != null) {
		current = current.parent;
		if (breakWhen != null && breakWhen(current)) return undefined;
		if (nodeCb(current)) return current as T;
	}
	return undefined;
}
