import {TS} from "../type/ts.js";

export type VisitorContinuation<T extends TS.Node> = (node: T) => TS.VisitResult<T>;
