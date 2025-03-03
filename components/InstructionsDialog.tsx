import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface InstructionsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstructionsDialog({ isOpen, onClose }: InstructionsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-3xl">Instructions</DialogTitle>
                    <DialogDescription className="text-base">
                        Please read the following instructions carefully. Don't hesitate to ask questions if you don't understand something.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 overflow-y-auto flex-grow">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Overview</h3>
                        <p className="text-base">
                            You'll be conducting an interview with AI Assistance. Depending on the trial mode, you will have access to various AI buttons that will help you with interviewing your interviewee.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Responsive Mode</h3>
                        <p>
                            If you are using the responsive mode, you don't need to do anything. The AI will automatically give you feedback in the feedback box on the top right.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Interactive Mode</h3>
                        <p>If you are using the interactive mode, you have three actions available:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Press the <span className="px-2 py-1 bg-secondary rounded-md text-sm">Generate follow-up</span> button to get a follow up worth asking given the context of the interview.</li>
                            <li>Press the <span className="px-2 py-1 bg-secondary rounded-md text-sm">Next Question</span> button to have AI suggest which next question you should move to in your protocol.</li>
                            <li>Press the <RefreshCw className="inline h-4 w-4" /> rephrase buttons on any question for an AI suggestion on rephrasing that question given the conversation context.</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            You can also select a question by clicking on it, for your own reference.
                        </p>
                    </div>

                    <div className="border-red-500 border-2 p-4 m-4 rounded-lg space-y-2">
                        <h3 className="font-semibold text-destructive">Important Notes:</h3>
                        <ul className="list-decimal pl-6 space-y-1 text-destructive">
                            <li>Do not refresh or close the tab in the middle of your session! Progress will be lost and you may need to restart.</li>
                            <li>Only start the interview after pressing the start AI button. Do NOT ask any questions while the AI is inactive.</li>
                            <li>Once finished, end the call, and you'll be redirected to a interview report page. Once here, ask the study moderator for next steps.</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-shrink-0">
                    <Button onClick={onClose} className="w-full">Got it!</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 