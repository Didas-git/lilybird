import type { Client, Emoji, PollLayoutType, Poll as LilyPoll, User as LilyUser } from "lilybird";
import { Message } from "./message.js";
import { User } from "./user.js";

export class PollMedia {
    public readonly text: string | undefined;
    public readonly emoji: Partial<Emoji.Structure> | undefined;

    public constructor(media: LilyPoll.MediaStructure) {
        this.text = media.text;
        this.emoji = media.emoji;
    }
}

export class PollAnswer {
    public readonly channelId: string;
    public readonly messageId: string;
    public readonly id: number;
    public readonly media: PollMedia;

    public readonly client: Client;

    public constructor(client: Client, channelId: string, messageId: string, answer: LilyPoll.AnswerStructure) {
        this.client = client;
        this.channelId = channelId;
        this.messageId = messageId;

        this.id = answer.answer_id;
        this.media = new PollMedia(answer.poll_media);
    }

    public async fetchVoters(params: {
        after?: string,
        /**
         * 0-100
         * @default 25
         */
        limit?: number
    }): Promise<Array<User>> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const voters = await this.client.rest.getPollAnswerVoters(this.channelId, this.messageId, this.id, params);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return voters.users.map((voter: LilyUser.Structure) => new User(this.client, voter));
    }
}

export class PollAnswerCount {
    public readonly id: number;
    public readonly count: number;
    public readonly meVoted: boolean;

    public constructor(answerCount: LilyPoll.AnswerCountStructure) {
        this.id = answerCount.id;
        this.count = answerCount.count;
        this.meVoted = answerCount.me_voted;
    }
}

export class PollResult {
    public readonly isFinalized: boolean;
    public readonly answerCounts: Array<PollAnswerCount>;

    public constructor(result: LilyPoll.ResultStructure) {
        this.isFinalized = result.is_finalized;
        this.answerCounts = result.answer_counts.map((answerCount) => new PollAnswerCount(answerCount));
    }
}

export class Poll {
    public readonly channelId: string;
    public readonly messageId: string;
    public readonly question: PollMedia;
    public readonly answers: Array<PollAnswer>;
    public readonly expiresTimestamp: Date | undefined;
    public readonly allowMultiselect: boolean;
    public readonly layoutType: PollLayoutType;
    public readonly results: PollResult | undefined;

    public readonly client: Client;

    public constructor(client: Client, channelId: string, messageId: string, poll: LilyPoll.Structure) {
        this.client = client;
        this.channelId = channelId;
        this.messageId = messageId;

        this.question = new PollMedia(poll.question);
        this.answers = poll.answers.map((answer) => new PollAnswer(this.client, this.channelId, this.messageId, answer));
        this.expiresTimestamp = poll.expiry ? new Date(poll.expiry) : undefined;
        this.allowMultiselect = poll.allow_multiselect;
        this.layoutType = poll.layout_type;
        this.results = poll.results ? new PollResult(poll.results) : undefined;
    }

    public async end(): Promise<Message> {
        return new Message(
            this.client,
            await this.client.rest.endPoll(this.channelId, this.messageId)
        );
    }
}
