import { ExtensionKey, Room } from "../api";
import { AhaExtension } from "./aha/AhaExtension";
import { Extension } from "./Extension";

const AVAILABLE_EXTENSIONS = [new AhaExtension()];

export class ExtensionManager {
	readonly #extensions: Extension[];


	constructor(enabledExtensionKeys: ReadonlyArray<ExtensionKey>) {
		this.#extensions = AVAILABLE_EXTENSIONS.filter(availableExtension => enabledExtensionKeys.includes(availableExtension.key));
	}

	getByRoom(room: Room): ReadonlyArray<Extension> {
		return this.#extensions.filter(extension => room.extensions.includes(extension.key));
	}
}