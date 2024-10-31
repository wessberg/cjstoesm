import prettier from "@prettier/sync";

export function formatCode(code: string): string {
	return prettier.format(code, {parser: "typescript", endOfLine: "lf"});
}
