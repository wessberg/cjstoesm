import {getExportsData} from "./get-exports-data";
import {isExpression} from "./is-expression";
import {walkThroughFillerNodes} from "./walk-through-filler-nodes";
import {BeforeVisitorOptions} from "../visitor/before-visitor-options";
import {TS} from "../../type/ts";

function hasExportAssignments(node: TS.Node, exportsName: string, typescript: typeof TS): boolean {
	const result = typescript.forEachChild<boolean>(node, nextNode => {
		if (isExpression(nextNode, typescript)) {
			if (getExportsData(nextNode, exportsName, typescript) != null) return true;
		}
		if (hasExportAssignments(nextNode, exportsName, typescript)) {
			return true;
		}

		return;
	});

	return result != null ? result : false;
}

export function getBestBodyInScope({node, context}: BeforeVisitorOptions<TS.Node>): TS.Node | undefined {
	const {typescript, factory} = context;
	if (!typescript.isSourceFile(node)) {
		return node;
	}

	const [firstStatement] = node.statements;
	if (!typescript.isExpressionStatement(firstStatement)) return node;
	const expression = walkThroughFillerNodes(firstStatement.expression, typescript);

	if (!typescript.isCallExpression(expression)) return node;
	const expressionExpression = walkThroughFillerNodes(expression.expression, typescript);
	if (!typescript.isFunctionExpression(expressionExpression)) return node;
	if (expression.arguments.length < 2) return node;
	let [, secondArgument] = expression.arguments;
	secondArgument = walkThroughFillerNodes(secondArgument, typescript);
	if (!typescript.isFunctionExpression(secondArgument)) return node;
	if (secondArgument.parameters.length < 1) return node;
	const [firstBodyParameter] = secondArgument.parameters;
	if (!typescript.isIdentifier(firstBodyParameter.name)) return node;
	if (hasExportAssignments(secondArgument.body, firstBodyParameter.name.text, typescript)) {
		context.exportsName = firstBodyParameter.name.text;

		return factory.updateSourceFile(
			node,
			[...secondArgument.body.statements, ...node.statements.slice(1)],
			node.isDeclarationFile,
			node.referencedFiles,
			node.typeReferenceDirectives,
			node.hasNoDefaultLib,
			node.libReferenceDirectives
		);
	}

	return node;
}
