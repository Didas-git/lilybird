import type { Emoji } from "./emoji.js";

export declare namespace Poll {
  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
   */
  export interface Structure extends CreateStructure {
    /** ISO8601 Timestamp */
    expiry: string | null;
    results?: ResultStructure;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
   */
  export interface CreateStructure {
    question: MediaStructure;
    answers: Array<AnswerStructure>;
    duration: number;
    allow_multiselect: boolean;
    layout_type: LayoutType;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
   */
  export interface MediaStructure {
    text?: string;
    emoji?: Partial<Emoji.Structure>;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
   */
  export interface AnswerStructure {
    answer_id: number;
    poll_media: MediaStructure;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
   */
  export interface ResultStructure {
    is_finalized: boolean;
    answer_counts: Array<AnswerCountStructure>;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
   */
  export interface AnswerCountStructure {
    id: number;
    count: number;
    me_voted: boolean;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
   */
  export enum LayoutType {
    DEFAULT = 1,
  }
}
