import { getExtensionConfig } from "../../api.ts";
import type { Extension } from "../Extension.ts";
import { AhaRoomButton } from "./AhaRoomButton.tsx";
import { AhaSubmitButton } from "./AhaSubmitButton.tsx";
import { AhaClient, AuthenticatingAhaClient } from "./api.ts";
import { AhaConfig } from "./model.ts";

const IDEA_PATTERN = /(\w+-I-?\d+)/;

export class AhaExtension implements Extension {
  key = "aha";
  label = "Aha!";

  RoomComponent = AhaRoomButton;
  SubmitComponent = AhaSubmitButton;

  #client: AhaClient | null = null;

  async getClient(): Promise<AhaClient> {
    if (this.#client == null) {
      this.#client = new AuthenticatingAhaClient(
        await getExtensionConfig<AhaConfig>(this.key),
      );
    }
    return this.#client;
  }

  static extractIdeaId(val: string): string | null {
    const matchArray = val.match(IDEA_PATTERN);
    return matchArray?.[1] ?? null;
  }
}

export const ahaExtension = new AhaExtension();
