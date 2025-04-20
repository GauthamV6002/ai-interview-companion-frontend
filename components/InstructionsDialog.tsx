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
                            You'll be conducting an interview with AI assistance. The system provides real-time feedback and analysis to help you conduct effective interviews. Your session will be recorded automatically.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Getting Started</h3>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Click the <span className="px-2 py-1 bg-secondary rounded-md text-sm">Start AI</span> button to begin your session</li>
                            <li>Wait for the recording indicator to appear before starting the interview</li>
                        </ol>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">During the Interview</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Select questions from the protocol panel by clicking on them</li>
                            <li>Real-time AI assistance will appear under the selected question</li>
                            <li><span className="font-medium">AI Summary Mode:</span> Click <span className="px-2 py-1 bg-secondary rounded-md text-sm">Give me Analysis</span> and get a summary and information gap identification about the current interviewee's response </li>
                            <li><span className="font-medium">AI Suggestion Mode:</span> A follow-up suggestion addressing the information gap will appear automatically after each interviewee's response</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Finishing the Interview</h3>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Click the <span className="px-2 py-1 bg-secondary rounded-md text-sm">Stop AI</span> button when finished</li>
                            <li>End the call, and you'll be redirected to a interview report page. Once there, ask the researcher for next steps.</li>
                        </ol>
                    </div>

                    <div className="border-red-500 border-2 p-4 m-4 rounded-lg space-y-2">
                        <h3 className="font-semibold text-destructive">Important Notes:</h3>
                        <ul className="list-decimal pl-6 space-y-1 text-destructive">
                            <li>Do not refresh or close the tab during your session - progress will be lost</li>

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