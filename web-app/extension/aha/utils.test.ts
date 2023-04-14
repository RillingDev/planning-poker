import { MockedObject, vi } from "vitest";
import { ahaExtension } from "./AhaExtension";
import { AhaClient } from "./api";
import { _getProductScoreFactNames } from "./utils";

vi.mock("./AhaExtension");

describe("utils", () => {
  describe("getProductScoreFactNames", () => {
    let ahaClient: MockedObject<AhaClient>;
    beforeEach(async () => {
      ahaClient = vi.mocked(await ahaExtension.getClient());
    });

    it("shows button", async () => {
      vi.mocked(ahaClient.getIdeasForProduct<"score_facts">).mockResolvedValue({
        ideas: [
          {
            id: "111",
            product_id: "456",
            score_facts: [],
          },
          {
            id: "222",
            product_id: "456",
            score_facts: [
              {
                name: "Foo",
                value: 0,
              },
            ],
          },
          {
            id: "333",
            product_id: "456",
            score_facts: [
              {
                name: "Foo",
                value: 0,
              },
              {
                name: "Bar",
                value: 0,
              },
            ],
          },
        ],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_records: 3,
        },
      });

      const scoreFactNames = await _getProductScoreFactNames("456");
      expect(scoreFactNames).toEqual(["Foo", "Bar"]);
      expect(ahaClient.getIdeasForProduct).toHaveBeenCalledWith("456", 1, 200, [
        "score_facts",
      ]);
    });
  });
});
