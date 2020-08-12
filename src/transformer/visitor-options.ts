import {VisitorContinuation} from "./visitor-continuation";
import {VisitorContext} from "./visitor-context";
import {TS} from "../type/ts";

export interface VisitorOptions<T extends TS.Node> {
	node: T;
	sourceFile: TS.SourceFile;
	context: VisitorContext;
	continuation: VisitorContinuation<TS.Node>;
	childContinuation: VisitorContinuation<TS.Node>;
}
