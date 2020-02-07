import {VisitorContext} from "../../visitor-context";
import {ModuleExports} from "../../module-exports/module-exports";
import {TS} from "../../../type/type";

export interface BeforeVisitorContext extends VisitorContext {
	transformationContext: TS.TransformationContext;
	exportsName: string | undefined;
	getModuleExportsForPath(path: string): ModuleExports | undefined;
	addModuleExportsForPath(path: string, exports: ModuleExports): void;
	markLocalAsExported(local: string): void;
	markDefaultAsExported(): void;
	isLocalExported(local: string): boolean;
	addImport(declaration: TS.ImportDeclaration, noEmit?: boolean): void;
	isModuleSpecifierImportedWithoutLocals(moduleSpecifier: string): boolean;
	getImportDeclarationWithModuleSpecifier(moduleSpecifier: string): TS.ImportDeclaration | undefined;
	getLocalForDefaultImportFromModule(moduleSpecifier: string): string | undefined;
	hasLocalForDefaultImportFromModule(moduleSpecifier: string): boolean;
	getLocalForNamespaceImportFromModule(moduleSpecifier: string): string | undefined;
	hasLocalForNamespaceImportFromModule(moduleSpecifier: string): boolean;
	getLocalForNamedImportPropertyNameFromModule(propertyName: string, moduleSpecifier: string): string | undefined;
	hasLocalForNamedImportPropertyNameFromModule(propertyName: string, moduleSpecifier: string): boolean;
	addTrailingStatements(...statements: TS.Statement[]): void;
	getFreeIdentifier(candidate: string): string;
	ignoreIdentifier(identifier: string): boolean;
	isIdentifierFree(identifier: string): boolean;
	readonly imports: TS.ImportDeclaration[];
	readonly trailingStatements: TS.Statement[];
	readonly isDefaultExported: boolean;
	readonly exportedLocals: Set<string>;
}
