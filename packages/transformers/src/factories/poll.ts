import { Message } from "./message.js";
import { User } from "./user.js";

import type {
    Poll as LilyPoll,
    User as LilyUser,
    PollLayoutType,
    Client
} from "lilybird";

export class PollAnswer {
    public readonly channelId: string;
    public readonly messageId: string;
    public readonly id: number;
    public readonly media: LilyPoll.MediaStructure;

    public readonly client: Client;

    public constructor(client: Client, channelId: string, messageId: string, answer: LilyPoll.AnswerStructure) {
        this.client = client;
        this.channelId = channelId;
        this.messageId = messageId;

        this.id = answer.answer_id;
        this.media = answer.poll_media;
    }

    public async fetchVoters(params: {
        after?: string,
        /**
         * 0-100
         * @default 25
         */
        limit?: number
    } = {}): Promise<Array<User>> {
        const voters = await this.client.rest.getAnswerVoters(this.channelId, this.messageId, this.id, params);

        return voters.users.map((voter: LilyUser.Structure) => new User(this.client, voter));
    }
}

export class Poll {
    public readonly channelId: string;
    public readonly messageId: string;
    public readonly question: LilyPoll.MediaStructure;
    public readonly answers: Array<PollAnswer>;
    public readonly expiresTimestamp: Date | undefined;
    public readonly allowMultiselect: boolean;
    public readonly layoutType: PollLayoutType;
    public readonly results: LilyPoll.ResultStructure | undefined;

    public readonly client: Client;

    public constructor(client: Client, channelId: string, messageId: string, poll: LilyPoll.Structure) {
        this.client = client;
        this.channelId = channelId;
        this.messageId = messageId;

        this.question = poll.question;
        this.answers = poll.answers.map((answer) => new PollAnswer(this.client, this.channelId, this.messageId, answer));
        this.allowMultiselect = poll.allow_multiselect;
        this.layoutType = poll.layout_type;
        this.results = poll.results;

        if (poll.expiry != null) this.expiresTimestamp = new Date(poll.expiry);
    }

    public async end(): Promise<Message> {
        return new Message(
            this.client,
            await this.client.rest.endPoll(this.channelId, this.messageId)
        );
    }
}
