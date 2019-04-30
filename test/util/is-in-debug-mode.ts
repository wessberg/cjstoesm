export function isInDebugMode(): boolean {
	const rawDebug = process.env.DEBUG;
	return rawDebug === "" || rawDebug === "true" || rawDebug === "1" || rawDebug === "y" || rawDebug === "yes";
}
