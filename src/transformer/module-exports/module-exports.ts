export interface ModuleExports {
	namedExports: Set<string>;
	hasDefaultExport: boolean;
	assert?: string;
}
