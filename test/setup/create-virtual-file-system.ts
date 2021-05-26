import path from "crosspath";
import {FileSystem} from "../../src/shared/file-system/file-system";
import {TestFileRecord} from "./test-file";
import {Volume, createFsFromVolume} from "memfs";

export function createVirtualFileSystem(files: TestFileRecord[]): FileSystem {
	const vol = new Volume();
	for (const file of files) {
		vol.mkdirSync(path.native.dirname(file.fileName), {recursive: true});
		vol.writeFileSync(path.native.normalize(file.fileName), file.text);
	}

	return createFsFromVolume(vol) as unknown as FileSystem;
}
