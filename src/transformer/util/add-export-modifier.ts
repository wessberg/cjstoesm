import {TS} from "../../type/ts.js";
import {VisitorContext} from "../visitor-context.js";

export function addExportModifier<T extends TS.ModifierLike>(
	modifiers: TS.NodeArray<T>|undefined,
	context: VisitorContext
): TS.NodeArray<T | TS.ExportKeyword> {
	const {factory, typescript} = context;
	if (!modifiers) {
		modifiers = factory.createNodeArray<T>()
	} else if (modifiers.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
		return modifiers
	}

	return factory.createNodeArray([
		factory.createModifier(typescript.SyntaxKind.ExportKeyword),
		...modifiers.map(m => (m.kind === typescript.SyntaxKind.Decorator
				? factory.createDecorator(m.expression)
				: factory.createModifier(m.kind)
		) as T)
	])
}
