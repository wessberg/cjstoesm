import {VisitorOptions} from "../visitor-options.js";
import {BeforeVisitorContext} from "./before-visitor-context.js";
import {TS} from "../../type/ts.js";

export interface BeforeVisitorOptions<T extends TS.Node> extends VisitorOptions<T> {
	context: BeforeVisitorContext;
}
