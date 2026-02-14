
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope, User, ArrowRight, BrainCircuit, HeartPulse, Clock, ShieldCheck, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-300 ring-1 ring-inset ring-blue-700/40 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live AI Inference Engine Active
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Healthcare Intelligence, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Beyond the Hospital
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Vitalyn bridges the critical gap between discharge and recovery. 
            Using multimodal AI to predict <span className="text-blue-400 font-semibold">Time-to-Risk</span> and optimize care delivery.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/patient">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
                <User className="mr-2 h-5 w-5" />
                Patient Portal
                <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
              </Button>
            </Link>
            <Link to="/opd-queue">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 hover:text-blue-400 backdrop-blur-sm transition-all hover:scale-105">
                <Stethoscope className="mr-2 h-5 w-5" />
                Doctor Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats / Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-white/10 pt-10">
            {[
              { label: "Active Patients", value: "2,400+" },
              { label: "Risk Predictions", value: "98.5%" },
              { label: "Response Time", value: "< 20ms" },
              { label: "Hospitals", value: "15+" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="text-sm leading-6 text-slate-400">{stat.label}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{stat.value}</dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative py-24 sm:py-32 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Clinical Excellence
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-400">
              A comprehensive system that transforms raw data into lifesaving insights.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "Multimodal Fusion",
                desc: "Combines wearable vitals, facial micro-expressions, and voice stress analysis for 360° patient monitoring.",
                icon: Activity,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
              },
              {
                title: "Predictive TTR Engine",
                desc: "Proprietary Time-to-Risk algorithms forecast deterioration hours before clinical symptoms appear.",
                icon: Clock,
                color: "text-indigo-400",
                bg: "bg-indigo-400/10",
              },
              {
                title: "Smart Queue Optimization",
                desc: "Dynamic hospital resource allocation based on medical urgency rather than first-come-first-serve.",
                icon: Zap,
                color: "text-amber-400",
                bg: "bg-amber-400/10",
              },
            ].map((feature) => (
              <Card key={feature.title} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800 transition-colors">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.bg} ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-16 shadow-2xl sm:px-16 lg:flex lg:gap-x-20 lg:px-24">
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-8 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform healthcare?
              <br />
              Start using WAITLESS AI+ today.
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Join the network of forward-thinking hospitals and empower your patients with the future of recovery monitoring.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link to="/patient">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started
                </Button>
              </Link>
              <Link to="/about" className="text-sm font-semibold leading-6 text-white hover:text-blue-100">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-white">WAITLESS AI+</span>
          </div>
          <p className="text-sm">&copy; 2024 WAITLESS AI+. Built for Healthcare Innovation.</p>
        </div>
      </footer>
    </div>
  );
}
