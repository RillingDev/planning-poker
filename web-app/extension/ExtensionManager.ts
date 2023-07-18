import { Room } from "../model";
import { Extension } from "./Extension";

export class ExtensionManager {
  readonly #extensions: ReadonlyArray<Extension>;

  constructor(enabledExtensions: ReadonlyArray<Extension>) {
    this.#extensions = enabledExtensions;
  }

  getByRoom(room: Room): ReadonlyArray<Extension> {
    return this.#extensions.filter((extension) =>
      room.extensions.includes(extension.key),
    );
  }

  getAll(): ReadonlyArray<Extension> {
    return this.#extensions;
  }
}
