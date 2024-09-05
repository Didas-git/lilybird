import type { Poll, PollLayoutType } from "lilybird";

export class PollBuilder {
    readonly #poll: Poll.CreateStructure = <never>{};

    public question(question: Poll.MediaStructure): this {
        this.#poll.question = question;
        return this;
    }

    public setAnswers(...answers: Array<Poll.AnswerStructure>): this {
        this.#poll.answers = answers;
        return this;
    }

    public addAnswer(answer: ((answer: PollAnswerBuilder) => PollAnswerBuilder) | PollAnswerBuilder): this {
        const realAnswer = typeof answer === "function"
            ? answer(new PollAnswerBuilder()).toJSON()
            : answer.toJSON();

        if (!Array.isArray(this.#poll.answers)) this.#poll.answers = [];
        this.#poll.answers.push(realAnswer);

        return this;
    }

    /**
     * @param duration - in hours (1 - 168)
     */
    public duration(duration: number): this {
        this.#poll.duration = duration;
        return this;
    }

    public allowMultiselect(allowMultiselect: boolean): this {
        this.#poll.allow_multiselect = allowMultiselect;
        return this;
    }

    public layoutType(layoutType: PollLayoutType): this {
        this.#poll.layout_type = layoutType;
        return this;
    }

    public toJSON(): Poll.CreateStructure {
        return this.#poll;
    }
}

export class PollAnswerBuilder {
    readonly #answer: Poll.AnswerStructure = <never>{};

    public id(id: number): this {
        this.#answer.answer_id = id;
        return this;
    }

    public media(media: Poll.MediaStructure): this {
        this.#answer.poll_media = media;
        return this;
    }

    public toJSON(): Poll.AnswerStructure {
        return this.#answer;
    }
}
