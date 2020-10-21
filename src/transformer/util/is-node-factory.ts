import {TS} from "../../type/ts";
import {CompatFactory} from "../../type/compat-factory";

export function isNodeFactory(compatFactory: CompatFactory): compatFactory is TS.NodeFactory {
	return !("updateSourceFileNode" in compatFactory);
}
