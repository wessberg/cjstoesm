import {Node, SourceFile} from "typescript";
import {VisitorContinuation} from "./visitor-continuation";
import {VisitorContext} from "./visitor-context";

export interface VisitorOptions<T extends Node> {
	node: T;
	sourceFile: SourceFile;
	context: VisitorContext;
	continuation: VisitorContinuation<Node>;
	childContinuation: VisitorContinuation<Node>;
}
