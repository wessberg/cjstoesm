import {prompt} from "inquirer";

// tslint:disable

/**
 * Provides a list of options that the user may select
 * @param {string} message
 * @param {T[]} items
 */
export async function checkbox<T extends string>(message: string, items: T[]): Promise<T[]> {
	const answer = (await prompt([
		{
			type: "checkbox",
			message: message,
			name: "checkbox",
			choices: items.map(item => ({name: item}))
		}
	])) as {checkbox: T[]};

	return answer.checkbox;
}
