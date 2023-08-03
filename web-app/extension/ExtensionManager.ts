import { Room } from "../model";
import { Extension } from "./Extension";

export class ExtensionManager {
  readonly #extensions: readonly Extension[];

  constructor(enabledExtensions: readonly Extension[]) {
    this.#extensions = enabledExtensions;
  }

  getByRoom(room: Room): readonly Extension[] {
    return this.#extensions.filter((extension) =>
      room.extensions.includes(extension.key),
    );
  }

  getAll(): readonly Extension[] {
    return this.#extensions;
  }
}
