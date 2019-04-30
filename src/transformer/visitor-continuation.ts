import {Node, VisitResult} from "typescript";

export type VisitorContinuation<T extends Node> = (node: T) => VisitResult<T>;
