import {VisitorContinuation} from "./visitor-continuation";
import {VisitorContext} from "./visitor-context";
import {TS} from "../type/ts";
import {CompatFactory} from "../type/compat-factory";

export interface VisitorOptions<T extends TS.Node> {
	node: T;
	compatFactory: CompatFactory;
	sourceFile: TS.SourceFile;
	context: VisitorContext;
	continuation: VisitorContinuation<TS.Node>;
	childContinuation: VisitorContinuation<TS.Node>;
}
