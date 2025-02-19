type InterviewQuestion = {
    id: Number;
    question: string;
    followUps: string[];
};

type Protocol = InterviewQuestion[];

export {InterviewQuestion, Protocol}