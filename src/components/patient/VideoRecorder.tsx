
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, CheckCircle } from "lucide-react";

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function VideoRecorder({ onRecordingComplete }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const startRecording = () => {
    chunksRef.current = [];
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      onRecordingComplete(blob);
      
      // Stop all tracks to release camera
      stream.getTracks().forEach(track => track.stop());
      setIsCameraReady(false);
    };

    mediaRecorder.start();
    setIsRecording(true);
    
    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        stopRecording();
      }
    }, 5000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const reset = () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    startCamera();
  };

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden border-0 shadow-none bg-transparent">
      <CardContent className="p-0 flex flex-col items-center gap-6">
        <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl ring-4 ring-slate-100 group">
          {previewUrl ? (
            <video src={previewUrl} controls className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
                onLoadedMetadata={() => videoRef.current?.play()}
              />
              {/* Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/50"></div>
                  <div className="border-r border-b border-white/50"></div>
                  <div className="border-b border-white/50"></div>
                  <div className="border-r border-b border-white/50"></div>
                  <div className="border-r border-b border-white/50 flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-white/30 rounded-full"></div>
                  </div>
                  <div className="border-b border-white/50"></div>
                  <div className="border-r border-white/50"></div>
                  <div className="border-r border-white/50"></div>
                  <div className=""></div>
                </div>
              </div>
            </>
          )}
          
          {isRecording && (
             <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">REC</span>
             </div>
          )}
          
          {!previewUrl && !isRecording && !isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
              <Button
                variant="secondary"
                className="z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20 h-12 px-6 rounded-full font-medium"
                onClick={startCamera}
              >
                <Camera className="mr-2 h-5 w-5" /> Enable Camera
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-4 w-full justify-center">
          {!recordedBlob ? (
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isCameraReady}
              className={`h-14 px-8 rounded-full text-base font-bold shadow-lg transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 hover:scale-105'}`}
            >
              {isRecording ? (
                <span className="flex items-center"><span className="w-3 h-3 bg-white rounded-sm mr-2 animate-pulse"/> Stop Recording</span>
              ) : (
                "Record 5s Clip"
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={reset} className="h-12 px-6 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
              <RefreshCw className="mr-2 h-4 w-4" /> Retake Video
            </Button>
          )}
          
          {recordedBlob && (
            <div className="flex items-center bg-green-50 px-4 py-2 rounded-full border border-green-100 text-green-700 font-bold shadow-sm animate-in fade-in zoom-in duration-300">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" /> Capture Ready
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          Please look directly at the camera. We analyze facial cues for fatigue and pain.
        </p>
      </CardContent>
    </Card>
  );
}
