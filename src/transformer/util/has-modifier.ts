import {TS} from "../../type/ts.js";

export function hasModifier(node: TS.Node, modifier: TS.ModifierSyntaxKind): boolean {
    const nodeModifiers = (node as {modifiers?: readonly TS.ModifierLike[]}).modifiers
    return !!nodeModifiers && nodeModifiers.some(m => m.kind === modifier);
}
