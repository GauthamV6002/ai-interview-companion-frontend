type InterviewQuestion = {
    id: Number;
    question: string;
    // followUps: string[];
    feedback?: {
        summary: string[];
        informationGap: string[];
        followUp: string;
    };
};

type Protocol = InterviewQuestion[];

export {InterviewQuestion, Protocol}