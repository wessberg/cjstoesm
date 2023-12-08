/* eslint-disable @typescript-eslint/no-explicit-any */

import { TS } from '../../type/ts'
import { BeforeVisitorContext } from '../visitor/before-visitor-context'

/**
 * Split the `decorators` and `modifiers` parameters for older versions of Typescript.
 * 
 * The `decorators` parameter has been removed in
 * https://github.com/microsoft/TypeScript/commit/1e65b330a71cc09065b31f1724d78e931aafed51#diff-db6fa105c495d655ffce5b52d0f5abaa1d59947ce2fa102ee023de15d15a0b80
 */
export function tsFactoryDecoratorsInterop<
    T extends (
        // update
        | ((node: any, modifiers: readonly TS.ModifierLike[]|undefined, ...others: any[]) => any)
        // create
        | ((modifiers: readonly TS.ModifierLike[]|undefined, ...others: any[]) => any)
    )
>(
    context: BeforeVisitorContext,
    func: T,
) {
    // I didn't check every Typescript version for different parameter names or different API types.
    // This solution relies on the guess that any modern use of `ModifierLike` translates
    // to `…decorators, modifiers…` parameters in older APIs and vice versa.
    const m = /^(?:function )?\w+\(((?:\s*\w\s*,)*)\s*decorators\s*,\s*modifiers\s*(?:,|\))/.exec(Function.prototype.toString.call(func))
    if (!m) {
        return func
    }
    const position = m[1] ? m[1].split(',').length : 0

    return function (this: unknown, ...a: unknown[]) {
        const modiferLike = a[position] as TS.NodeArray<TS.ModifierLike>|undefined
        if (!modiferLike) {
            a.splice(position, 1, undefined, undefined)
        } else {
            const decorators: TS.Decorator[] = []
            const modifiers: TS.Modifier[] = []
            for (const el of modiferLike) {
                if (el.kind === context.typescript.SyntaxKind.Decorator) {
                    decorators.push(el)
                } else {
                    modifiers.push(el)
                }
            }
            a.splice(position, 1,
                decorators.length ? context.factory.createNodeArray(decorators) : undefined,
                modifiers.length ? context.factory.createNodeArray(modifiers) : undefined,
            )
        }
        return (func as any).apply(this, a)
    } as T
}
