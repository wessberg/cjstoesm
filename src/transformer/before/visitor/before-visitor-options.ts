import {VisitorOptions} from "../../visitor-options";
import {BeforeVisitorContext} from "./before-visitor-context";
import {TS} from "../../../type/ts";

export interface BeforeVisitorOptions<T extends TS.Node> extends VisitorOptions<T> {
	context: BeforeVisitorContext;
}
