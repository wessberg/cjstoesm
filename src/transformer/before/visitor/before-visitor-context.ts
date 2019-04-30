import {VisitorContext} from "../../visitor-context";
import {ImportDeclaration, Statement, TransformationContext} from "typescript";
import {ModuleExports} from "../../module-exports/module-exports";

export interface BeforeVisitorContext extends VisitorContext {
	transformationContext: TransformationContext;
	getModuleExportsForPath(path: string): ModuleExports | undefined;
	addModuleExportsForPath(path: string, exports: ModuleExports): void;
	markLocalAsExported(local: string): void;
	markDefaultAsExported(): void;
	isLocalExported(local: string): boolean;
	addImport(declaration: ImportDeclaration, noEmit?: boolean): void;
	isModuleSpecifierImportedWithoutLocals(moduleSpecifier: string): boolean;
	getImportDeclarationWithModuleSpecifier(moduleSpecifier: string): ImportDeclaration | undefined;
	getLocalForDefaultImportFromModule(moduleSpecifier: string): string | undefined;
	hasLocalForDefaultImportFromModule(moduleSpecifier: string): boolean;
	getLocalForNamespaceImportFromModule(moduleSpecifier: string): string | undefined;
	hasLocalForNamespaceImportFromModule(moduleSpecifier: string): boolean;
	getLocalForNamedImportPropertyNameFromModule(propertyName: string, moduleSpecifier: string): string | undefined;
	hasLocalForNamedImportPropertyNameFromModule(propertyName: string, moduleSpecifier: string): boolean;
	addTrailingStatements(...statements: Statement[]): void;
	getFreeIdentifier(candidate: string): string;
	ignoreIdentifier(identifier: string): boolean;
	isIdentifierFree(identifier: string): boolean;
	readonly imports: ImportDeclaration[];
	readonly trailingStatements: Statement[];
	readonly isDefaultExported: boolean;
	readonly exportedLocals: Set<string>;
}
