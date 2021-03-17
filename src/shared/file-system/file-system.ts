import {existsSync, MakeDirectoryOptions, mkdirSync, Mode, PathLike, readFileSync, statSync, writeFileSync} from "fs";
import {nativeNormalize} from "../../transformer/util/path-util";

export interface ReadonlyFileSystem {
	readFile: (file: string) => string|undefined;
	fileExists: (file: string) => boolean;
	directoryExists: (directory: string) => boolean;
}

export interface FileSystem extends ReadonlyFileSystem {
	writeFile: typeof writeFileSync;
	mkdir: typeof mkdirSync;
}

export const realReadonlyFileSystem: ReadonlyFileSystem = {
	fileExists: (file) => existsSync(nativeNormalize(file)) && !statSync(nativeNormalize(file)).isDirectory(),
	directoryExists: file => existsSync(nativeNormalize(file)) && statSync(nativeNormalize(file)).isDirectory(),
	readFile: file => (existsSync(nativeNormalize(file)) ? readFileSync(nativeNormalize(file)).toString() : undefined),
};

export const realFileSystem: FileSystem = {
	...realReadonlyFileSystem,
	mkdir: (path: PathLike, options?: Mode | MakeDirectoryOptions | null) => mkdirSync(path, options),
	writeFile: (path, content) => writeFileSync(path, content)
};