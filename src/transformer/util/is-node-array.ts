import { TS } from '../../type/ts'

export function isNodeArray<T>(t: T): t is T & readonly TS.Node[] {
    return Array.isArray(t)
}