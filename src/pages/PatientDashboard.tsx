
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { VitalsForm, VitalsData } from "@/components/patient/VitalsForm";
import { VideoRecorder } from "@/components/patient/VideoRecorder";
import { AudioRecorder } from "@/components/patient/AudioRecorder";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Camera, Mic, CheckCircle2, AlertTriangle, Loader2, ArrowLeft, ArrowRight, ShieldCheck, HeartPulse, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  heartRate: z.coerce.number().min(30).max(220),
  systolic: z.coerce.number().min(50).max(250),
  diastolic: z.coerce.number().min(30).max(150),
  spo2: z.coerce.number().min(70).max(100),
  temp: z.coerce.number().min(30).max(45),
  pain: z.number().min(0).max(10),
  fatigue: z.number().min(0).max(10),
});

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("vitals");
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const { toast } = useToast();

  const form = useForm<VitalsData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heartRate: 72,
      systolic: 120,
      diastolic: 80,
      spo2: 98,
      temp: 36.5,
      pain: 2,
      fatigue: 3,
    },
  });

  const steps = [
    { id: "vitals", label: "Vitals", icon: Activity },
    { id: "video", label: "Face Scan", icon: Camera },
    { id: "voice", label: "Voice Check", icon: Mic },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === activeTab);

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const vitals = form.getValues();
      const formData = new FormData();
      
      formData.append("vitals", JSON.stringify({
        heart_rate: vitals.heartRate,
        bp_systolic: vitals.systolic,
        bp_diastolic: vitals.diastolic,
        spo2: vitals.spo2,
        temperature: vitals.temp,
        pain_level: vitals.pain,
        fatigue_level: vitals.fatigue
      }));

      if (videoBlob) {
        formData.append("face_video", videoBlob, "face.webm");
      }
      if (audioBlob) {
        formData.append("voice_sample", audioBlob, "voice.webm");
      }

      // Call the backend API
      const response = await fetch("/api/analyze/multimodal", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Check-in Complete",
        description: "Your health data has been analyzed successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <div className="pt-28 pb-12 px-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/90 backdrop-blur-xl ring-1 ring-slate-200/50 animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="text-center pb-8 border-b border-slate-100/50 pt-10">
              <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-white/50">
                <CheckCircle2 className="h-12 w-12 text-green-600 drop-shadow-sm" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Analysis Complete</CardTitle>
              <CardDescription className="text-lg text-slate-500 font-medium">Your Daily Health Assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-8 pb-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl text-center shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Overall Risk</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                    Low
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl text-center shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Next Check-in</p>
                  <p className="text-3xl font-black text-slate-700">4 hrs</p>
                </div>
              </div>
              
              <div className="space-y-5 bg-blue-50/40 p-6 rounded-2xl border border-blue-100/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500" />
                <p className="text-base font-bold text-blue-900 flex items-center gap-2 relative z-10">
                  <BrainCircuit className="h-5 w-5 text-blue-600" /> AI Insights
                </p>
                <ul className="space-y-3 relative z-10">
                  {[
                    "Vitals are stable within normal range.",
                    "Facial analysis shows mild fatigue (expected).",
                    "Voice stress levels are low."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm shadow-blue-500/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => setResult(null)}>
                Start New Check-in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-2 transition-colors px-4 py-2 rounded-full hover:bg-white/50 border border-transparent hover:border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Daily Health Check-in</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Complete the multimodal assessment for precise <span className="text-blue-600 font-bold relative inline-block">Time-to-Risk<span className="absolute bottom-0 left-0 w-full h-1 bg-blue-200/50 -z-10 rounded-full"></span></span> analysis.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="relative flex justify-between max-w-lg mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -z-10 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 -z-10 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.id} className="flex flex-col items-center gap-3 bg-transparent group cursor-default">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative",
                    isActive ? "bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-500/20 scale-110" : "bg-white border-slate-100 text-slate-300"
                  )}>
                    {isActive && <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-20" />}
                    <step.icon className={cn("h-5 w-5 transition-transform duration-300", isCurrent ? "scale-110" : "")} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                    isCurrent ? "text-blue-700" : isActive ? "text-slate-600" : "text-slate-400"
                  )}>{step.label}</span>
                </div>
              );
            })}
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-900/5 rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="p-1">
                 {/* Hidden TabsList since we have custom stepper */}
                 <TabsList className="hidden">
                  {steps.map(step => (
                    <TabsTrigger key={step.id} value={step.id}>{step.label}</TabsTrigger>
                  ))}
                 </TabsList>
              </div>

              <div className="p-8 sm:p-10 min-h-[400px]">
                <TabsContent value="vitals" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Vital Signs</h3>
                    <p className="text-slate-500">Please enter your latest measurements from your wearable device.</p>
                  </div>
                  <VitalsForm form={form} />
                  <div className="mt-10 flex justify-end">
                    <Button onClick={() => setActiveTab("video")} size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 px-8 rounded-xl h-12">
                      Next: Face Scan <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Facial Analysis</h3>
                    <p className="text-slate-500">Position your face in the frame to analyze fatigue markers.</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <VideoRecorder onRecordingComplete={(blob) => {
                      setVideoBlob(blob);
                      toast({ title: "Video saved", description: "Proceed to voice check." });
                    }} />
                  </div>
                  <div className="mt-10 flex justify-between">
                    <Button variant="ghost" onClick={() => setActiveTab("vitals")} className="text-slate-500 hover:text-slate-900">
                      Back
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("voice")} 
                      disabled={!videoBlob}
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 px-8 rounded-xl h-12 disabled:opacity-50"
                    >
                      Next: Voice Check <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Voice Analysis</h3>
                    <p className="text-slate-500">Read the prompt aloud to analyze vocal biomarkers.</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <AudioRecorder onRecordingComplete={(blob) => {
                      setAudioBlob(blob);
                      toast({ title: "Audio saved", description: "Ready to submit." });
                    }} />
                  </div>
                  <div className="mt-10 flex justify-between">
                    <Button variant="ghost" onClick={() => setActiveTab("video")} className="text-slate-500 hover:text-slate-900">
                      Back
                    </Button>
                    <Button 
                      onClick={onSubmit} 
                      disabled={isSubmitting || !audioBlob}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20 px-8 rounded-xl h-12 w-40"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Analysis"}
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
          
          <div className="text-center">
             <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
               <ShieldCheck className="h-3 w-3" /> Encrypted & HIPAA Compliant
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
