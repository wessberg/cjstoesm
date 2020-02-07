import {prompt} from "inquirer";

// tslint:disable

/**
 * Prints a 'confirm' prompt in the terminal
 *
 * @param message
 * @param [defaultValue]
 */
export async function confirm(message: string, defaultValue?: boolean): Promise<boolean> {
	const answer = await prompt([
		{
			type: "confirm",
			message,
			name: "confirm",
			default: defaultValue
		}
	]);

	return answer.confirm;
}
