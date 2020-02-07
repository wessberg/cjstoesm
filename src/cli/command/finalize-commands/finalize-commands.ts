import commander from "commander";

const args = [...process.argv];
if (args[2] !== "transform") {
	args.splice(2, 0, "transform");
}
commander.parse(args);

// Show help if no arguments are given
if (commander.args.length === 0) {
	commander.help(text => `Welcome to the CJS to ESM CLI!\n\n` + text);
}
