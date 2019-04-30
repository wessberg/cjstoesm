import {Node} from "typescript";
import {VisitorOptions} from "../../visitor-options";
import {BeforeVisitorContext} from "./before-visitor-context";

export interface BeforeVisitorOptions<T extends Node> extends VisitorOptions<T> {
	context: BeforeVisitorContext;
}
