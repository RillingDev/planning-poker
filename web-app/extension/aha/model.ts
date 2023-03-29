export interface AhaConfig {
  readonly accountDomain: string;
  readonly clientId: string;
  readonly redirectUri: string;
}

type ScoreFactName = string;

export interface AhaRoomConfig {
  readonly scoreFactName: ScoreFactName | null;
}

interface ScoreFact {
  readonly name: ScoreFactName;
  readonly value: number;
}

export interface FullIdea {
  readonly id: string;
  readonly name: string;

  readonly reference_num: string;
  readonly product_id: string;
  /**
   * Empty if Aha! idea score was never updated.
   */
  readonly score_facts: ScoreFact[];

  readonly description: {
    id: string;
    /**
     * HTML.
     */
    body: string;
    created_at: string;
    attachments: unknown[];
  };
}

// Aha! Responses can be filtered to only contain some fields.
type BaseIdea = Pick<FullIdea, "id" | "product_id">;
export type IdeaFilterField = keyof Omit<FullIdea, keyof BaseIdea>;
export type Idea<T extends IdeaFilterField> = BaseIdea & Pick<FullIdea, T>;