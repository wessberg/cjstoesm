import {prompt} from "inquirer";

// tslint:disable

/**
 * Provides a "radio button group" of potential options the user may pick
 * @param {string} message
 * @param {T[]} items
 */
export async function radio<T extends string>(message: string, items: T[]): Promise<T> {
	const answer = (await prompt([
		{
			type: "rawlist",
			message,
			name: "rawlist",
			choices: items.map(item => ({name: item}))
		}
	])) as {rawlist: T};

	return answer.rawlist;
}
