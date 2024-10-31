import type {VisitorOptions} from "../visitor-options.js";
import type {BeforeVisitorContext} from "./before-visitor-context.js";
import type {TS} from "../../type/ts.js";

export interface BeforeVisitorOptions<T extends TS.Node> extends VisitorOptions<T> {
	context: BeforeVisitorContext;
}
