import { ahaExtension } from "./aha/AhaExtension";
import { Extension } from "./Extension";
import { ExtensionKey, Room } from "../model.ts";

const AVAILABLE_EXTENSIONS: readonly Extension[] = [ahaExtension];

export function getEnabledExtensions(
  enabledExtensionKeys: readonly ExtensionKey[],
): readonly Extension[] {
  return AVAILABLE_EXTENSIONS.filter((availableExtension) =>
    enabledExtensionKeys.includes(availableExtension.key),
  );
}

export function getActiveExtensionsByRoom(
  enabledExtensions: readonly Extension[],
  room: Room,
): readonly Extension[] {
  return enabledExtensions.filter((extension) =>
    room.extensions.includes(extension.key),
  );
}
