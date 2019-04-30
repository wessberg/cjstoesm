export type ElementOf<ArrayType> = ArrayType extends (infer ElementType)[]
	? ElementType
	: ArrayType extends readonly (infer ReadonlyElementType)[]
	? ReadonlyElementType
	: ArrayType extends Set<infer SetElementType>
	? SetElementType
	: never;
