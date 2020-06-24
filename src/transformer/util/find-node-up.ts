import {TS} from "../../type/type";

export function findNodeUp<T extends TS.Node>(from: TS.Node, nodeCb: (node: TS.Node) => node is T, breakWhen?: (node: TS.Node) => boolean): T | undefined;
export function findNodeUp<T extends TS.Node>(from: TS.Node, nodeCb: (node: TS.Node) => boolean, breakWhen?: (node: TS.Node) => boolean): T | undefined;
export function findNodeUp<T extends TS.Node>(from: TS.Node, nodeCb: (node: TS.Node) => boolean, breakWhen?: (node: TS.Node) => boolean): T | undefined {
	let current = from as TS.Node | T;
	while (current.parent != null) {
		current = current.parent;
		if (breakWhen != null && breakWhen(current)) return undefined;
		if (nodeCb(current)) return current as T;
	}
	return undefined;
}
