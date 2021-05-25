import {nativeDirname, nativeNormalize} from "../../src/transformer/util/path-util";
import {FileSystem} from "../../src/shared/file-system/file-system";
import {TestFileRecord} from "./test-file";
import {Volume, createFsFromVolume} from "memfs";

export function createVirtualFileSystem(files: TestFileRecord[]): FileSystem {
	const vol = new Volume();
	for (const file of files) {
		vol.mkdirSync(nativeDirname(file.fileName), {recursive: true});
		vol.writeFileSync(nativeNormalize(file.fileName), file.text);
	}

	return createFsFromVolume(vol) as unknown as FileSystem;
}
