import {TS} from "../type/ts";

export type VisitorContinuation<T extends TS.Node> = (node: T) => TS.VisitResult<T>;
