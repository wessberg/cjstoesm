export interface ModuleExports {
	namedExports: Set<string>;
	hasDefaultExport: boolean;
	withValue?: string;
}
