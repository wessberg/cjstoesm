import {VisitorContext} from "../visitor-context";
import {ModuleExports} from "../module-exports/module-exports";
import {TS} from "../../type/ts";

export interface BeforeVisitorContext extends VisitorContext {
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
	addLeadingStatements(...statements: TS.Statement[]): void;
	addTrailingStatements(...statements: TS.Statement[]): void;
	getFreeIdentifier(candidate: string, force?: boolean): string;
	ignoreIdentifier(identifier: string): boolean;
	isIdentifierFree(identifier: string): boolean;
	addLocal(identifier: string): void;
	readonly imports: TS.ImportDeclaration[];
	readonly leadingStatements: TS.Statement[];
	readonly trailingStatements: TS.Statement[];
	readonly isDefaultExported: boolean;
	readonly exportedLocals: Set<string>;
}
