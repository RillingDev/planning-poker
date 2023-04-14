import { MockedObject, vi } from "vitest";
import { Extension } from "../../Extension";
import { AhaClient } from "../api";

/**
 * Mock version of AhaExtension.
 *
 * Provides a mock {@link AhaClient}, and {@link #extractIdeaId} that rejects things starting with "X".
 */
class MockAhaExtension implements Extension {
  key = "aha";
  label = "Aha!";

  #client = {
    getIdea: vi.fn(),
    getIdeasForProduct: vi.fn(),
    putIdeaScore: vi.fn(),
  };

  RoomComponent = vi.fn();
  SubmitComponent = vi.fn();

  getClient(): Promise<MockedObject<AhaClient>> {
    return Promise.resolve(this.#client);
  }

  static extractIdeaId(val: string): string | null {
    if (val.startsWith("X")) {
      return null;
    }
    return val;
  }
}

const mockAhaExtension = new MockAhaExtension();

export { mockAhaExtension as ahaExtension, MockAhaExtension as AhaExtension };
