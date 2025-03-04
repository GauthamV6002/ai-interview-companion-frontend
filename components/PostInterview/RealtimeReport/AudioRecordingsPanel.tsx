import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Music, Loader2 } from 'lucide-react';
import { useTranscriptLog } from '@/context/TranscriptLogContext';
import { Separator } from '@/components/ui/separator';

// Define a type for the FFmpeg module
type FFmpeg = {
    load: () => Promise<void>;
    isLoaded: () => boolean;
    write: (name: string, data: Uint8Array) => Promise<void>;
    exec: (command: string[]) => Promise<number>;
    read: (name: string) => Promise<Uint8Array>;
};

declare global {
    interface Window {
        FFmpeg: {
            createFFmpeg: (options: any) => FFmpeg;
            fetchFile: (file: File | Blob) => Promise<Uint8Array>;
        };
    }
}

const AudioRecordingsPanel = () => {
    const { transcript, audioBlobs } = useTranscriptLog();
    const [isProcessing, setIsProcessing] = useState(false);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
    
    // Load FFmpeg.wasm when the component mounts
    useEffect(() => {
        const loadFFmpeg = async () => {
            try {
                // Load FFmpeg script dynamically
                if (!document.getElementById('ffmpeg-script')) {
                    const script = document.createElement('script');
                    script.id = 'ffmpeg-script';
                    script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
                    script.async = true;
                    script.onload = async () => {
                        try {
                            const { createFFmpeg } = window.FFmpeg;
                            const ffmpegInstance = createFFmpeg({ 
                                log: true,
                                corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
                            });
                            await ffmpegInstance.load();
                            setFfmpeg(ffmpegInstance);
                            setFfmpegLoaded(true);
                            console.log('FFmpeg loaded successfully');
                        } catch (err) {
                            console.error('Error initializing FFmpeg:', err);
                        }
                    };
                    document.body.appendChild(script);
                }
            } catch (err) {
                console.error('Error loading FFmpeg script:', err);
            }
        };
        
        loadFFmpeg();
        
        // Cleanup
        return () => {
            const script = document.getElementById('ffmpeg-script');
            if (script) {
                document.body.removeChild(script);
            }
        };
    }, []);
    
    // Get all recording sessions from the transcript
    const recordingSessions = transcript
        .filter(item => item.aiEvent === "recording-stopped")
        .map((item, index) => {
            if (!item.aiEventData) return null;
            
            try {
                const data = JSON.parse(item.aiEventData);
                return {
                    id: index,
                    startTime: data.startTime,
                    stopTime: data.stopTime,
                    duration: data.duration,
                    blobIndex: data.blobIndex
                };
            } catch (err) {
                console.error('Error parsing recording data:', err);
                return null;
            }
        })
        .filter(Boolean);
    
    // Function to download a specific recording
    const downloadRecording = (index: number) => {
        if (index >= audioBlobs.length) {
            console.error('Recording not found');
            return;
        }
        
        const blob = audioBlobs[index];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const url = URL.createObjectURL(blob);
        
        // Create a download link
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `interview-recording-${index + 1}-${timestamp}.webm`;
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    
    // Function to combine audio using Web Audio API and convert to MP4 using FFmpeg
    const combineAudioAndConvertToMP4 = async () => {
        if (audioBlobs.length === 0) {
            alert('No recordings available to download');
            return;
        }
        
        setIsProcessing(true);
        
        try {
            // If there's only one recording, just download it directly
            if (audioBlobs.length === 1) {
                downloadRecording(0);
                setIsProcessing(false);
                return;
            }
            
            // First, combine the audio using Web Audio API
            // Create audio context
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Convert blobs to audio buffers
            const audioBuffersPromises = audioBlobs.map(async (blob) => {
                const arrayBuffer = await blob.arrayBuffer();
                return await audioContext.decodeAudioData(arrayBuffer);
            });
            
            const audioBuffers = await Promise.all(audioBuffersPromises);
            
            // Calculate total duration
            const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.duration, 0);
            
            // Create a buffer with the total length and same number of channels as the first buffer
            const numberOfChannels = audioBuffers[0].numberOfChannels;
            const sampleRate = audioBuffers[0].sampleRate;
            const combinedBuffer = audioContext.createBuffer(
                numberOfChannels, 
                sampleRate * totalLength, 
                sampleRate
            );
            
            // Copy each buffer to the combined buffer
            let offset = 0;
            for (const buffer of audioBuffers) {
                for (let channel = 0; channel < numberOfChannels; channel++) {
                    const channelData = buffer.getChannelData(channel);
                    combinedBuffer.copyToChannel(channelData, channel, offset);
                }
                offset += buffer.length;
            }
            
            // Convert the combined buffer to a WAV file
            const wavBlob = bufferToWave(combinedBuffer, combinedBuffer.length);
            
            // If FFmpeg is not loaded, fall back to downloading WAV
            if (!ffmpeg || !ffmpegLoaded) {
                console.warn('FFmpeg not loaded, falling back to WAV download');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const url = URL.createObjectURL(wavBlob);
                
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = `complete-interview-recording-${timestamp}.wav`;
                a.click();
                
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return;
            }
            
            // Convert WAV to MP4 using FFmpeg
            try {
                const { fetchFile } = window.FFmpeg;
                
                // Write the WAV file to FFmpeg's virtual file system
                const wavData = await fetchFile(wavBlob);
                await ffmpeg.write('input.wav', wavData);
                
                // Run FFmpeg command to convert WAV to MP4
                await ffmpeg.exec([
                    '-i', 'input.wav',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    'output.mp4'
                ]);
                
                // Read the output MP4 file
                const mp4Data = await ffmpeg.read('output.mp4');
                
                // Create a Blob from the MP4 data
                const mp4Blob = new Blob([new Uint8Array(mp4Data.buffer)], { type: 'video/mp4' });
                
                // Download the MP4 file
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const url = URL.createObjectURL(mp4Blob);
                
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = `complete-interview-recording-${timestamp}.mp4`;
                a.click();
                
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                console.log('MP4 conversion and download completed successfully');
            } catch (ffmpegError) {
                console.error('Error converting to MP4 with FFmpeg:', ffmpegError);
                
                // Fall back to WAV download
                console.warn('Falling back to WAV download');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const url = URL.createObjectURL(wavBlob);
                
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = `complete-interview-recording-${timestamp}.wav`;
                a.click();
                
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
            
            // Close the audio context
            audioContext.close();
            
        } catch (err) {
            console.error('Error combining recordings:', err);
            alert('Error combining recordings. Falling back to simple download method.');
            
            // Fallback to simple download method
            audioBlobs.forEach((_, index) => {
                setTimeout(() => {
                    downloadRecording(index);
                }, index * 500);
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Helper function to convert an AudioBuffer to a WAV Blob
    const bufferToWave = (abuffer: AudioBuffer, len: number) => {
        const numOfChan = abuffer.numberOfChannels;
        const length = len * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let i;
        let sample;
        let offset = 0;
        let pos = 0;
        
        // Write WAVE header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"
        
        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit
        
        setUint32(0x61746164);                         // "data" chunk
        setUint32(length - pos - 4);                   // chunk length
        
        // Write interleaved data
        for (i = 0; i < abuffer.numberOfChannels; i++) {
            channels.push(abuffer.getChannelData(i));
        }
        
        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {
                // Clamp the value to the 16-bit range
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                // Convert to 16-bit signed integer
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
        
        return new Blob([buffer], { type: "audio/wav" });
        
        function setUint16(data: number) {
            view.setUint16(pos, data, true);
            pos += 2;
        }
        
        function setUint32(data: number) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    };
    
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">Audio Recordings</CardTitle>
                <CardDescription>
                    {audioBlobs.length > 0 
                        ? `${audioBlobs.length} recording${audioBlobs.length > 1 ? 's' : ''} available for download` 
                        : 'No recordings available'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {audioBlobs.length > 0 ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <Button 
                                onClick={combineAudioAndConvertToMP4}
                                className="flex items-center gap-2"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        Download Combined Recording (MP4)
                                    </>
                                )}
                            </Button>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-4">
                            {recordingSessions.map((session, index) => (
                                session && (
                                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <Music className="text-primary" size={20} />
                                            <div>
                                                <p className="font-medium">Recording {index + 1}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.startTime} - {session.stopTime} (Duration: {session.duration})
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => downloadRecording(session.blobIndex)}
                                            className="flex items-center gap-1"
                                            disabled={isProcessing}
                                        >
                                            <Download size={14} />
                                            Download
                                        </Button>
                                    </div>
                                )
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        No recordings were made during the interview session.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AudioRecordingsPanel; 