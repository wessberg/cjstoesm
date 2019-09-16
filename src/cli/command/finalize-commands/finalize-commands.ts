import commander from "commander";

commander.parse(process.argv);

// Show help if no arguments are given
if (commander.args.length === 0) {
	commander.help(text => {
		return `Welcome to the CJS to ESM CLI!\n\n` + text;
	});
}
