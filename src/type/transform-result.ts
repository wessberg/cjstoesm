export interface TransformedFile {
	fileName: string;
	text: string;
}

export interface TransformResult {
	files: TransformedFile[];
}
