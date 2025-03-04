import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Play, Pause, Volume2, Clock } from 'lucide-react';
import { useTranscriptLog } from '@/context/TranscriptLogContext';
import { Separator } from '@/components/ui/separator';
import { AudioSegment } from '@/context/TranscriptLogContext';

const SegmentedAudioPanel = () => {
    const { audioSegments } = useTranscriptLog();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);
    
    // Format pause duration from milliseconds to human-readable format
    const formatPauseDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    };
    
    // Play an audio segment
    const playSegment = (segment: AudioSegment, index: number) => {
        if (segment.type !== 'audio') return;
        
        // Stop current playback if any
        if (audioRef.current) {
            audioRef.current.pause();
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }
        }
        
        // Create new audio element if needed
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.onended = () => {
                setIsPlaying(false);
                setCurrentPlayingIndex(null);
            };
        }
        
        // Set up new audio source
        const url = URL.createObjectURL(segment.blob);
        audioUrlRef.current = url;
        audioRef.current.src = url;
        audioRef.current.play();
        
        setIsPlaying(true);
        setCurrentPlayingIndex(index);
    };
    
    // Stop playing audio
    const stopPlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            setCurrentPlayingIndex(null);
        }
    };
    
    // Download a specific audio segment
    const downloadSegment = (segment: AudioSegment, index: number) => {
        if (segment.type !== 'audio') return;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const url = URL.createObjectURL(segment.blob);
        
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `speech-segment-${index + 1}-${timestamp}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    
    // Combine all audio segments (both speech and pauses) into a single timeline visualization
    const renderTimeline = () => {
        if (audioSegments.length === 0) return null;
        
        return (
            <div className="my-6">
                <h3 className="text-lg font-medium mb-2">Conversation Timeline</h3>
                <div className="flex items-center w-full h-8 bg-secondary/20 rounded-md overflow-hidden">
                    {audioSegments.map((segment, index) => {
                        if (segment.type === 'audio') {
                            // Calculate width based on audio length (approximate from blob size)
                            const sizeInKB = segment.blob.size / 1024;
                            // Rough estimate: 1KB ~= 0.1 seconds of audio
                            const widthPercent = Math.max(1, Math.min(50, sizeInKB * 0.1));
                            
                            return (
                                <div 
                                    key={index}
                                    className="h-full bg-primary cursor-pointer hover:bg-primary/80 transition-colors"
                                    style={{ width: `${widthPercent}%` }}
                                    onClick={() => playSegment(segment, index)}
                                    title={`Speech segment at ${segment.timestamp}`}
                                />
                            );
                        } else {
                            // Calculate width based on pause duration
                            const durationInSec = segment.pauseDuration / 1000;
                            const widthPercent = Math.max(0.5, Math.min(20, durationInSec * 2));
                            
                            return (
                                <div 
                                    key={index}
                                    className="h-full bg-destructive/40"
                                    style={{ width: `${widthPercent}%` }}
                                    title={`Pause of ${formatPauseDuration(segment.pauseDuration)} at ${segment.timestamp}`}
                                />
                            );
                        }
                    })}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Start</span>
                    <span>End</span>
                </div>
            </div>
        );
    };
    
    // Function to download all audio segments as a single file
    const downloadAllSegments = async () => {
        if (audioSegments.length === 0) {
            alert('No segments available to download');
            return;
        }
        
        setIsProcessing(true);
        
        try {
            // Filter out only the audio segments
            const audioOnlySegments = audioSegments
                .filter((segment): segment is { type: 'audio'; timestamp: string; blob: Blob } => 
                    segment.type === 'audio');
            
            if (audioOnlySegments.length === 0) {
                alert('No audio segments found');
                setIsProcessing(false);
                return;
            }
            
            // If there's only one segment, just download it directly
            if (audioOnlySegments.length === 1) {
                downloadSegment(audioOnlySegments[0], 0);
                setIsProcessing(false);
                return;
            }
            
            // For multiple segments, combine them
            const combinedBlob = new Blob(
                audioOnlySegments.map(segment => segment.blob),
                { type: 'audio/webm' }
            );
            
            // Download the combined file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const url = URL.createObjectURL(combinedBlob);
            
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `speech-segments-combined-${timestamp}.webm`;
            a.click();
            
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (err) {
            console.error('Error combining audio segments:', err);
            alert('Error combining audio segments. See console for details.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Count audio and pause segments
    const audioCount = audioSegments.filter(segment => segment.type === 'audio').length;
    const pauseCount = audioSegments.filter(segment => segment.type === 'pause').length;
    
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">Segmented Speech Analysis</CardTitle>
                <CardDescription>
                    {audioSegments.length > 0 
                        ? `${audioCount} speech segment${audioCount !== 1 ? 's' : ''} and ${pauseCount} pause${pauseCount !== 1 ? 's' : ''} detected` 
                        : 'No speech segments available'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {audioSegments.length > 0 ? (
                    <>
                        <div className="flex justify-between mb-4">
                            <div>
                                {isPlaying && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={stopPlayback}
                                        className="flex items-center gap-1"
                                    >
                                        <Pause size={14} />
                                        Stop Playback
                                    </Button>
                                )}
                            </div>
                            <Button 
                                onClick={downloadAllSegments}
                                className="flex items-center gap-2"
                                disabled={isProcessing || audioCount === 0}
                            >
                                <Download size={16} />
                                Download All Speech Segments
                            </Button>
                        </div>
                        
                        {renderTimeline()}
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                            {audioSegments.map((segment, index) => (
                                <div 
                                    key={index} 
                                    className={`flex items-center justify-between p-3 rounded-md ${
                                        segment.type === 'audio' ? 'bg-secondary/20' : 'bg-destructive/10'
                                    } ${currentPlayingIndex === index ? 'border-2 border-primary' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {segment.type === 'audio' ? (
                                            <>
                                                <Volume2 className="text-primary" size={20} />
                                                <div>
                                                    <p className="font-medium">Speech Segment {audioSegments.filter((s, i) => s.type === 'audio' && i <= index).length}</p>
                                                    <p className="text-sm text-muted-foreground">Recorded at {segment.timestamp}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="text-destructive/80" size={20} />
                                                <div>
                                                    <p className="font-medium">Pause ({formatPauseDuration(segment.pauseDuration)})</p>
                                                    <p className="text-sm text-muted-foreground">Detected at {segment.timestamp}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {segment.type === 'audio' && (
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => currentPlayingIndex === index && isPlaying ? stopPlayback() : playSegment(segment, index)}
                                                className="flex items-center gap-1 w-24"
                                            >
                                                {currentPlayingIndex === index && isPlaying ? (
                                                    <>
                                                        <Pause size={14} />
                                                        Stop
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play size={14} />
                                                        Play
                                                    </>
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => downloadSegment(segment, index)}
                                                className="flex items-center gap-1"
                                            >
                                                <Download size={14} />
                                                Download
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Debug section */}
                        <Separator className="my-6" />
                        <div className="bg-black/20 p-4 rounded-md mt-8">
                            <h3 className="text-lg font-medium mb-2">Debug Information</h3>
                            <div className="space-y-2">
                                <p>Total segments: {audioSegments.length}</p>
                                <p>Audio segments: {audioCount}</p>
                                <p>Pause segments: {pauseCount}</p>
                                
                                <details className="mt-4">
                                    <summary className="cursor-pointer font-medium">Raw Segment Data</summary>
                                    <pre className="mt-2 p-2 bg-black/40 rounded-md text-xs overflow-auto max-h-60">
                                        {audioSegments.map((segment, index) => {
                                            const data = segment.type === 'audio' 
                                                ? `Audio: ${segment.timestamp}, size: ${segment.blob.size} bytes` 
                                                : `Pause: ${segment.timestamp}, duration: ${segment.pauseDuration}ms`;
                                            return `[${index}] ${data}\n`;
                                        }).join('')}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        No speech segments were detected during the interview session.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SegmentedAudioPanel; 