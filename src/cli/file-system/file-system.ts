import {existsSync, readFileSync, writeFileSync, mkdirSync} from "fs";

export interface FileSystem {
	writeFileSync: typeof writeFileSync;
	readFileSync: typeof readFileSync;
	existsSync: typeof existsSync;
	mkdirSync: typeof mkdirSync;
}
