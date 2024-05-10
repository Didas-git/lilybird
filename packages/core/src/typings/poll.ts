import type { PollLayoutType } from "#enums";
import type { Emoji } from "./emoji.js";
import type { User } from "./user.js";

export declare namespace Poll {
    /**
     * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
     */
    export interface Structure {
        question: MediaStructure;
        answers: Array<AnswerStructure>;
        /** ISO8601 Timestamp */
        expiry: string | null;
        allow_multiselect: boolean;
        layout_type: PollLayoutType;
        results?: ResultStructure;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
     */
    export interface CreateStructure {
        question: MediaStructure;
        answers: Array<AnswerStructure>;
        /** in hours (1 - 168) */
        duration: number;
        allow_multiselect: boolean;
        layout_type?: PollLayoutType;
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
     * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
     */
    export interface AnswerVotersStructure {
        users: Array<User.Structure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
     * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
     */
    export interface GatewayPayload {
        user_id: string;
        channel_id: string;
        message_id: string;
        guild_id?: string;
        answer_id: number;
    }
}
