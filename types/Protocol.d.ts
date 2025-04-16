type InterviewQuestion = {
    id: Number;
    question: string;
    followUps: string[];
    feedback?: {
        summary: string[];
        informationGap: string;
    };
};

type Protocol = InterviewQuestion[];

export {InterviewQuestion, Protocol}