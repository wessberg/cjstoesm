import {prompt} from "inquirer";

// tslint:disable

/**
 * Prints a 'confirm' prompt in the terminal
 * @param {string} message
 * @param {boolean} [defaultValue]
 */
export async function confirm(message: string, defaultValue?: boolean): Promise<boolean> {
	const answer = (await prompt([
		{
			type: "confirm",
			message,
			name: "confirm",
			default: defaultValue
		}
	])) as {confirm: boolean};

	return answer.confirm;
}
