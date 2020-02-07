import {visitNode} from "./visitor/visit/visit-node";
import {BeforeVisitorContext} from "./visitor/before-visitor-context";
import {BeforeVisitorOptions} from "./visitor/before-visitor-options";
import {check} from "reserved-words";
import {isNamedDeclaration} from "../util/is-named-declaration";
import {BeforeTransformerOptions} from "./before-transformer-options";
import {getLocalsForBindingName} from "../util/get-locals-for-binding-name";
import {shouldSkipEmit} from "../util/should-skip-emit";
import {ModuleExports} from "../module-exports/module-exports";
import {visitImportAndExportDeclarations} from "./visitor/visit/visit-import-and-export-declarations";
import {normalize} from "path";
import {TS} from "../../type/type";

export interface BeforeTransformerSourceFileStepResult {
	sourceFile: TS.SourceFile;
	exports: ModuleExports;
}

export function transformSourceFile(
	sourceFile: TS.SourceFile,
	{baseVisitorContext}: BeforeTransformerOptions,
	context: TS.TransformationContext
): BeforeTransformerSourceFileStepResult {
	// Take a fast path of the text of the SourceFile doesn't contain anything that can be transformed
	if (!baseVisitorContext.onlyExports && !sourceFile.text.includes("require") && !sourceFile.text.includes("exports")) {
		return {sourceFile, exports: {namedExports: new Set(), hasDefaultExport: false}};
	}

	const {typescript} = baseVisitorContext;

	// Prepare a VisitorContext
	const visitorContext = ((): BeforeVisitorContext => {
		const imports: Map<TS.ImportDeclaration, boolean> = new Map();
		const trailingStatements: TS.Statement[] = [];
		const moduleExportsMap: Map<string, ModuleExports> = new Map();
		const localsMap = (sourceFile as {locals?: Map<string, symbol>}).locals;
		const locals = localsMap == null ? new Set() : new Set(localsMap.keys());
		const exportedLocals = new Set<string>();
		let isDefaultExported = false;

		const addImport = (declaration: TS.ImportDeclaration, noEmit = false): void => {
			imports.set(declaration, noEmit);
		};

		const markLocalAsExported = (local: string): void => {
			exportedLocals.add(local);
		};

		const isLocalExported = (local: string): boolean => exportedLocals.has(local);

		const markDefaultAsExported = (): void => {
			isDefaultExported = true;
		};

		const getImportDeclarationWithModuleSpecifier = (moduleSpecifier: string): TS.ImportDeclaration | undefined =>
			[...imports.keys()].find(
				declaration =>
					declaration.moduleSpecifier != null &&
					typescript.isStringLiteralLike(declaration.moduleSpecifier) &&
					declaration.moduleSpecifier.text === moduleSpecifier
			);

		const isModuleSpecifierImportedWithoutLocals = (moduleSpecifier: string): boolean => {
			const matchingDeclaration = getImportDeclarationWithModuleSpecifier(moduleSpecifier);
			if (matchingDeclaration == null) return false;
			return (
				matchingDeclaration.importClause == null ||
				(matchingDeclaration.importClause.name == null && matchingDeclaration.importClause.namedBindings == null)
			);
		};

		const getLocalForDefaultImportFromModule = (moduleSpecifier: string): string | undefined => {
			const matchingDeclaration = getImportDeclarationWithModuleSpecifier(moduleSpecifier);
			if (matchingDeclaration == null) return undefined;
			if (matchingDeclaration.importClause == null || matchingDeclaration.importClause.name == null) return undefined;
			return matchingDeclaration.importClause.name.text;
		};

		const hasLocalForDefaultImportFromModule = (moduleSpecifier: string): boolean => getLocalForDefaultImportFromModule(moduleSpecifier) != null;

		const getLocalForNamespaceImportFromModule = (moduleSpecifier: string): string | undefined => {
			const matchingDeclaration = getImportDeclarationWithModuleSpecifier(moduleSpecifier);
			if (matchingDeclaration == null) {
				return undefined;
			}
			if (
				matchingDeclaration.importClause == null ||
				matchingDeclaration.importClause.namedBindings == null ||
				!typescript.isNamespaceImport(matchingDeclaration.importClause.namedBindings)
			) {
				return undefined;
			}
			return matchingDeclaration.importClause.namedBindings.name.text;
		};

		const hasLocalForNamespaceImportFromModule = (moduleSpecifier: string): boolean => getLocalForNamespaceImportFromModule(moduleSpecifier) != null;

		const getLocalForNamedImportPropertyNameFromModule = (propertyName: string, moduleSpecifier: string): string | undefined => {
			const matchingDeclaration = getImportDeclarationWithModuleSpecifier(moduleSpecifier);
			if (matchingDeclaration == null) return undefined;
			if (
				matchingDeclaration.importClause == null ||
				matchingDeclaration.importClause.namedBindings == null ||
				!typescript.isNamedImports(matchingDeclaration.importClause.namedBindings)
			) {
				return undefined;
			}
			for (const element of matchingDeclaration.importClause.namedBindings.elements) {
				if (element.propertyName != null && element.propertyName.text === propertyName) return element.name.text;
				else if (element.propertyName == null && element.name.text === propertyName) return element.name.text;
			}
			return undefined;
		};

		const hasLocalForNamedImportPropertyNameFromModule = (propertyName: string, moduleSpecifier: string): boolean =>
			getLocalForNamedImportPropertyNameFromModule(propertyName, moduleSpecifier) != null;

		const addTrailingStatements = (...statements: TS.Statement[]): void => {
			trailingStatements.push(...statements);
		};

		const isIdentifierFree = (identifier: string): boolean =>
			// It should not be part of locals of the module already
			!locals.has(identifier) &&
			// It should not be a reserved word in any environment
			!check(identifier, "es3", true) &&
			!check(identifier, "es5", true) &&
			!check(identifier, "es2015", true);

		const ignoreIdentifier = (identifier: string): boolean => locals.delete(identifier);

		const getFreeIdentifier = (candidate: string): string => {
			const suffix = "$";
			let counter = 0;

			if (isIdentifierFree(candidate)) {
				locals.add(candidate);
				return candidate;
			}

			while (true) {
				const currentCandidate = candidate + suffix + counter;
				if (!isIdentifierFree(currentCandidate)) {
					counter++;
				} else {
					locals.add(currentCandidate);
					return currentCandidate;
				}
			}
		};

		return {
			...baseVisitorContext,
			transformationContext: context,
			exportsName: undefined,
			addImport,
			markLocalAsExported,
			markDefaultAsExported,
			isLocalExported,
			isModuleSpecifierImportedWithoutLocals,
			getImportDeclarationWithModuleSpecifier,
			getLocalForDefaultImportFromModule,
			hasLocalForDefaultImportFromModule,
			getLocalForNamespaceImportFromModule,
			hasLocalForNamespaceImportFromModule,
			getLocalForNamedImportPropertyNameFromModule,
			hasLocalForNamedImportPropertyNameFromModule,
			addTrailingStatements,
			isIdentifierFree,
			getFreeIdentifier,
			ignoreIdentifier,
			getModuleExportsForPath: path => moduleExportsMap.get(normalize(path)),
			addModuleExportsForPath: (path, exports) => moduleExportsMap.set(normalize(path), exports),
			get imports() {
				return [...imports.entries()].filter(([, noEmit]) => !noEmit).map(([declaration]) => declaration);
			},
			get trailingStatements() {
				return trailingStatements;
			},
			get isDefaultExported() {
				return isDefaultExported;
			},
			get exportedLocals() {
				return exportedLocals;
			}
		};
	})();

	const visitorBaseOptions: Pick<BeforeVisitorOptions<TS.Node>, Exclude<keyof BeforeVisitorOptions<TS.Node>, "node" | "sourceFile">> = {
		context: visitorContext,

		continuation: node =>
			visitNode({
				...visitorBaseOptions,
				sourceFile,
				node
			}),
		childContinuation: node =>
			typescript.visitEachChild(
				node,
				cbNode => {
					const visitResult = visitNode({
						...visitorBaseOptions,
						sourceFile,
						node: cbNode
					});
					if (shouldSkipEmit(visitResult, typescript)) {
						return typescript.createNotEmittedStatement(cbNode);
					}
					return visitResult;
				},
				context
			)
	};

	const importVisitorBaseOptions: Pick<BeforeVisitorOptions<TS.Node>, Exclude<keyof BeforeVisitorOptions<TS.Node>, "node" | "sourceFile">> = {
		context: visitorContext,

		continuation: node =>
			visitImportAndExportDeclarations({
				...importVisitorBaseOptions,
				sourceFile,
				node
			}),
		childContinuation: node =>
			typescript.visitEachChild(
				node,
				cbNode => {
					const visitResult = visitImportAndExportDeclarations({
						...importVisitorBaseOptions,
						sourceFile,
						node: cbNode
					});
					if (shouldSkipEmit(visitResult, typescript)) {
						return typescript.createNotEmittedStatement(cbNode);
					}
					return visitResult;
				},
				context
			)
	};

	// Visit all imports and exports first
	visitImportAndExportDeclarations({...importVisitorBaseOptions, sourceFile, node: sourceFile});

	let updatedSourceFile = visitNode({...visitorBaseOptions, sourceFile, node: sourceFile}) as TS.SourceFile;

	const allImports: TS.Statement[] = [
		...visitorContext.imports,
		...updatedSourceFile.statements.filter(typescript.isImportDeclaration),
		...visitorContext.trailingStatements.filter(typescript.isImportDeclaration)
	];

	const allExports: TS.Statement[] = [
		...updatedSourceFile.statements.filter(statement => typescript.isExportDeclaration(statement) || typescript.isExportAssignment(statement)),
		...visitorContext.trailingStatements.filter(statement => typescript.isExportDeclaration(statement) || typescript.isExportAssignment(statement))
	];

	const allOtherStatements = [
		...updatedSourceFile.statements.filter(
			statement => !allImports.includes(statement) && !allExports.includes(statement) && statement.kind !== typescript.SyntaxKind.NotEmittedStatement
		),
		...visitorContext.trailingStatements.filter(statement => !allImports.includes(statement) && !allExports.includes(statement))
	];

	updatedSourceFile = typescript.updateSourceFileNode(
		updatedSourceFile,
		[...allImports, ...allOtherStatements, ...allExports],
		sourceFile.isDeclarationFile,
		sourceFile.referencedFiles,
		sourceFile.typeReferenceDirectives,
		sourceFile.hasNoDefaultLib,
		sourceFile.libReferenceDirectives
	);

	// Update the SourceFile with the extra statements
	const moduleExports: ModuleExports = {
		hasDefaultExport: false,
		namedExports: new Set()
	};

	for (const statement of updatedSourceFile.statements) {
		if (typescript.isExportDeclaration(statement) && statement.exportClause != null) {
			for (const element of statement.exportClause.elements) {
				moduleExports.namedExports.add(element.name.text);
			}
		} else if (typescript.isExportAssignment(statement)) {
			moduleExports.hasDefaultExport = true;
		} else if (statement.modifiers != null && statement.modifiers.some((m: TS.Modifier) => m.kind === typescript.SyntaxKind.ExportKeyword)) {
			if (statement.modifiers.some((m: TS.Modifier) => m.kind === typescript.SyntaxKind.DefaultKeyword)) {
				moduleExports.hasDefaultExport = true;
			} else if (typescript.isVariableStatement(statement)) {
				for (const declaration of statement.declarationList.declarations) {
					for (const local of getLocalsForBindingName(declaration.name, typescript)) {
						moduleExports.namedExports.add(local);
					}
				}
			} else if (isNamedDeclaration(statement, typescript) && statement.name != null && typescript.isIdentifier(statement.name)) {
				moduleExports.namedExports.add(statement.name.text);
			}
		}
	}

	// Add the relevant module exports for the SourceFile
	visitorContext.addModuleExportsForPath(normalize(sourceFile.fileName), moduleExports);
	if (!visitorContext.onlyExports && visitorContext.debug && visitorContext.printer != null) {
		console.log("===", normalize(sourceFile.fileName), "===");
		console.log(visitorContext.printer.printFile(updatedSourceFile));
		console.log("EXPORTS:", visitorContext.exportedLocals);
	}

	return {
		sourceFile: updatedSourceFile,
		exports: moduleExports
	};
}
