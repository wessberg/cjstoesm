import {TS} from "../type/type";

export type VisitorContinuation<T extends TS.Node> = (node: T) => TS.VisitResult<T>;
