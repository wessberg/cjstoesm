/* eslint-disable @typescript-eslint/unified-signatures */
import path from "crosspath";
import type {IgnoredLookupValue} from "helpertypes";
import type {TS} from "../../type/ts.js";

export interface RandomPathOptions {
	extension: string;
	prefix: string;
	suffix: string;
}

export function isArray<T>(value: readonly T[]): value is readonly T[];
export function isArray<T>(value: T[]): value is T[];
export function isArray<T>(value: T[] | readonly T[]): value is T[] | readonly T[];
export function isArray<T>(value: T | readonly T[]): value is readonly T[];
export function isArray<T>(value: T | T[]): value is T[];
export function isArray<T>(value: T | T[] | readonly T[]): value is T[] | readonly T[];
export function isArray<T>(value: unknown): value is T[] | readonly T[];
export function isArray<T>(value: unknown): value is T[] | readonly T[] {
	return Array.isArray(value);
}

export function generateRandomPath({extension = "", prefix = "__#auto-generated-", suffix = String(Math.floor(Math.random() * 100000))}: Partial<RandomPathOptions> = {}) {
	return `${prefix}${suffix}${extension}`;
}

/**
 * Ensures that the given item is in fact an array
 */
export function ensureArray<T>(item: T | T[]): T[] {
	return Array.isArray(item) ? item : [item];
}

export function getFolderClosestToRoot(root: string, files: Iterable<string>): string {
	const [head] = files;
	if (head == null) {
		throw new ReferenceError(`At least 1 file must be provided`);
	}
	let candidate = head;

	for (const file of files) {
		const relativeToRoot = path.relative(root, file);
		if (relativeToRoot.split("/").length < candidate.split("/").length) {
			candidate = relativeToRoot;
		}
	}

	return path.join(root, path.dirname(candidate));
}

export function rewriteFilenamePath(root: string, filename: string, outDir?: string) {
	if (outDir == null) return path.normalize(filename);
	const {dir, base} = path.parse(filename);

	let relativeDirFromSrc = dir === "" ? path.join(path.relative(root, dir)) : path.join(path.relative(root, dir), "../");

	if (relativeDirFromSrc.startsWith("/")) {
		relativeDirFromSrc = relativeDirFromSrc.slice(1);
	}
	if (relativeDirFromSrc.startsWith("./")) {
		relativeDirFromSrc = relativeDirFromSrc.slice(2);
	}
	if (relativeDirFromSrc.includes("/")) {
		relativeDirFromSrc = relativeDirFromSrc.slice(relativeDirFromSrc.indexOf("/") + 1);
	} else {
		relativeDirFromSrc = ``;
	}
	return path.join(outDir, relativeDirFromSrc, base);
}

export function normalizeGlob(glob: string): string {
	return path.extname(glob) === "" && !glob.endsWith("*") ? `${glob}/*` : glob;
}

export function isRecord<T>(value: T): value is Exclude<T, IgnoredLookupValue | unknown[]> & {} {
	return (
		!Array.isArray(value) &&
		typeof value === "object" &&
		value != null &&
		!(value instanceof Date) &&
		!(value instanceof Set) &&
		!(value instanceof WeakSet) &&
		!(value instanceof Map) &&
		!(value instanceof WeakMap)
	);
}

export function getModifierLikes(node: TS.Node): readonly TS.ModifierLike[] | undefined {
	const modifiers = "modifiers" in node && isArray(node.modifiers) ? (node.modifiers as readonly TS.ModifierLike[]) : [];
	if ("decorators" in node && Array.isArray(node.decorators)) {
		return [...(node.decorators as TS.Decorator[]), ...modifiers];
	} else {
		return modifiers;
	}
}

export function canHaveModifiers(node: TS.Node, typescript: typeof TS): node is TS.HasModifiers {
	if ("canHaveModifiers" in typescript) {
		return typescript.canHaveModifiers(node);
	} else {
		return true;
	}
}
export function getModifiers(node: TS.HasModifiers, typescript: typeof TS): readonly TS.Modifier[] | undefined {
	if ("getModifiers" in typescript) {
		return typescript.getModifiers(node);
	} else {
		return node.modifiers?.filter(modifier => !("expression" in modifier)) as readonly TS.Modifier[] | undefined;
	}
}

export function canHaveDecorators(node: TS.Node, typescript: typeof TS): node is TS.HasDecorators {
	if ("canHaveDecorators" in typescript) {
		return typescript.canHaveDecorators(node);
	} else {
		return true;
	}
}

export function getDecorators(node: TS.HasDecorators, typescript: typeof TS): readonly TS.Decorator[] | undefined {
	if ("getDecorators" in typescript) {
		return typescript.getDecorators(node);
	} else {
		const legacyDecorators = "decorators" in node && isArray(node.decorators) ? (node.decorators as readonly TS.Decorator[]) : undefined;
		const decoratorModifierLikes = node.modifiers?.filter(modifier => "expression" in modifier) as readonly TS.Decorator[] | undefined;
		return [...(legacyDecorators ?? []), ...(decoratorModifierLikes ?? [])];
	}
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function addExportModifier<T extends TS.HasModifiers>(node: T, typescript: typeof TS, factory: TS.NodeFactory): readonly TS.ModifierLike[] {
	return addModifier(node, typescript, factory, typescript.SyntaxKind.ExportKeyword);
}

export function hasExportModifier(node: TS.Node, typescript: typeof TS): node is TS.HasModifiers {
	return hasModifier(node, typescript, typescript.SyntaxKind.ExportKeyword);
}

export function hasDefaultExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return hasExportModifier(node, typescript) && hasModifier(node, typescript, typescript.SyntaxKind.DefaultKeyword);
}

export function hasModifier(node: TS.Node, typescript: typeof TS, modifier: TS.ModifierSyntaxKind): boolean {
	return canHaveModifiers(node, typescript) ? Boolean(node.modifiers?.some(m => m.kind === modifier)) : false;
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function addModifier<T extends TS.HasModifiers>(node: T, typescript: typeof TS, factory: TS.NodeFactory, modifier: TS.ModifierSyntaxKind): readonly TS.ModifierLike[] {
	const modifiers = getModifiers(node, typescript) ?? [];

	if (modifiers.some(m => m.kind === modifier)) return modifiers;

	if (!canHaveDecorators(node, typescript)) {
		return [factory.createModifier(modifier), ...modifiers.map(m => factory.createModifier(m.kind))];
	} else {
		const decorators = getDecorators(node, typescript) ?? [];
		return [factory.createModifier(modifier), ...modifiers.map(m => factory.createModifier(m.kind)), ...decorators.map(decorator => factory.createDecorator(decorator.expression))];
	}
}

export function isTypeAssertionExpression(node: TS.Node, typescript: typeof TS): node is TS.TypeAssertion {
	if ("isTypeAssertionExpression" in (typescript as never)) {
		return typescript.isTypeAssertionExpression(node);
	} else {
		return Boolean((typescript as {isTypeAssertion?: typeof typescript.isTypeAssertionExpression}).isTypeAssertion?.(node));
	}
}
