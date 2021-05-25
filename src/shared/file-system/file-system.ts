import * as fs from "fs";

export type ReadonlyFileSystem = Pick<typeof fs, "statSync" | "lstatSync" | "readFileSync" | "readdirSync">;

export interface SafeReadonlyFileSystem extends ReadonlyFileSystem {
	safeStatSync: (path: string) => fs.Stats | undefined;
	safeReadFileSync: (path: string) => Buffer | undefined;
}

export type FileSystem = ReadonlyFileSystem & Pick<typeof fs, "writeFileSync" | "mkdirSync">;
export type SafeFileSystem = SafeReadonlyFileSystem & Pick<typeof fs, "writeFileSync" | "mkdirSync">;

export const realReadonlyFileSystem: ReadonlyFileSystem = {
	statSync: fs.statSync,
	lstatSync: fs.lstatSync,
	readdirSync: fs.readdirSync,
	readFileSync: fs.readFileSync
};

export const realFileSystem: FileSystem = {
	...realReadonlyFileSystem,
	mkdirSync: fs.mkdirSync,
	writeFileSync: fs.writeFileSync
};

export function createSafeFileSystem(fileSystem: FileSystem): SafeFileSystem;
export function createSafeFileSystem(fileSystem: ReadonlyFileSystem): SafeReadonlyFileSystem;
export function createSafeFileSystem(fileSystem: FileSystem | ReadonlyFileSystem): SafeFileSystem | SafeReadonlyFileSystem {
	return {
		...fileSystem,

		safeReadFileSync: path => {
			try {
				return fileSystem.readFileSync(path);
			} catch {
				return undefined;
			}
		},
		safeStatSync: path => {
			try {
				return fileSystem.statSync(path);
			} catch {
				return undefined;
			}
		}
	};
}
