import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope, User, ArrowRight, BrainCircuit, Clock, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import gsap from "gsap";

export default function Index() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.1, ease: "power3.out" }
        );
      }

      if (subRef.current) {
        gsap.fromTo(
          subRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power2.out" }
        );
      }

      const pixels = gsap.utils.toArray<HTMLElement>(".health-pixel");
      if (pixels.length) {
        pixels.forEach((el, index) => {
          gsap.to(el, {
            keyframes: [
              { opacity: 0, y: 10, scale: 0.8, duration: 0 },
              { opacity: 1, y: -20, scale: 1, duration: 0.6, ease: "power2.out" },
              { opacity: 0, y: -50, scale: 1.05, duration: 0.6, ease: "power2.in" },
            ],
            repeat: -1,
            delay: index * 0.25,
          });
        });
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current.children,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: 0.3,
            ease: "power2.out",
            stagger: 0.08,
          }
        );
      }

      const handleMove = (event: MouseEvent) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const relX = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const relY = (event.clientY - rect.top - rect.height / 2) / rect.height;
        const pixels = gsap.utils.toArray<HTMLElement>(".health-pixel");
        gsap.to(pixels, {
          x: (_, i) => relX * (12 + (i % 5) * 4),
          y: (_, i) => relY * (10 + (i % 7) * 3),
          duration: 0.5,
          ease: "power2.out",
        });
      };

      heroRef.current?.addEventListener("mousemove", handleMove);

      return () => {
        heroRef.current?.removeEventListener("mousemove", handleMove);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative z-10 min-h-screen bg-gradient-to-b from-[#3a3e61] via-[#3a3e61] to-[#f1ede2] font-sans selection:bg-[#3a3e61]/20 overflow-hidden"
    >
      <Navbar />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a3e61] via-[#4c5591] to-[#3a3e61]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-[3rem] bg-[#f1ede2]/30 blur-[140px]" />
        <div className="absolute bottom-[-35%] right-[-20%] h-[520px] w-[780px] rounded-[3.5rem] bg-[#4c5591]/55 blur-[160px]" />
      </div>

      <section className="relative pt-24 pb-20 lg:pt-28 lg:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-12 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
          <div className="relative flex-[1.2] flex justify-start">
            <div className="relative w-80 sm:w-[34rem] lg:w-[50rem] -ml-10 sm:-ml-16 lg:-ml-28">
              <img
                src="/dino.png"
                alt="Vitalyn mascot"
                className="w-full h-auto drop-shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0">
                <svg
                  className="health-pixel absolute right-[48px] top-[46%] w-9"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <rect x="6" y="2" width="4" height="4" fill="#f1ede2" />
                  <rect x="6" y="6" width="4" height="4" fill="#f1ede2" />
                  <rect x="6" y="10" width="4" height="4" fill="#f1ede2" />
                  <rect x="2" y="6" width="4" height="4" fill="#f1ede2" />
                  <rect x="10" y="6" width="4" height="4" fill="#f1ede2" />
                </svg>
                <svg
                  className="health-pixel absolute right-[88px] top-[40%] w-10"
                  viewBox="0 0 20 16"
                  aria-hidden="true"
                >
                  <rect x="2" y="7" width="4" height="2" fill="#f1ede2" />
                  <rect x="6" y="6" width="2" height="4" fill="#f1ede2" />
                  <rect x="8" y="4" width="2" height="6" fill="#f1ede2" />
                  <rect x="10" y="6" width="2" height="4" fill="#f1ede2" />
                  <rect x="12" y="7" width="4" height="2" fill="#f1ede2" />
                </svg>
                <svg
                  className="health-pixel absolute right-[120px] top-[34%] w-8"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="4" height="4" fill="#f97373" />
                  <rect x="9" y="5" width="4" height="4" fill="#f97373" />
                  <rect x="5" y="7" width="6" height="4" fill="#f97373" />
                  <rect x="5" y="11" width="2" height="2" fill="#f97373" />
                  <rect x="9" y="11" width="2" height="2" fill="#f97373" />
                </svg>
                <svg
                  className="health-pixel absolute right-[72px] top-[56%] w-7"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <rect x="6" y="2" width="4" height="4" fill="#f1ede2" />
                  <rect x="6" y="6" width="4" height="4" fill="#f1ede2" />
                  <rect x="6" y="10" width="4" height="4" fill="#f1ede2" />
                  <rect x="2" y="6" width="4" height="4" fill="#f1ede2" />
                  <rect x="10" y="6" width="4" height="4" fill="#f1ede2" />
                </svg>
                <svg
                  className="health-pixel absolute right-[110px] top-[52%] w-8"
                  viewBox="0 0 20 16"
                  aria-hidden="true"
                >
                  <rect x="2" y="7" width="4" height="2" fill="#f1ede2" />
                  <rect x="6" y="6" width="2" height="4" fill="#f1ede2" />
                  <rect x="8" y="4" width="2" height="6" fill="#f1ede2" />
                  <rect x="10" y="6" width="2" height="4" fill="#f1ede2" />
                  <rect x="12" y="7" width="4" height="2" fill="#f1ede2" />
                </svg>
                <svg
                  className="health-pixel absolute right-[52px] top-[36%] w-7"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="4" height="4" fill="#f97373" />
                  <rect x="9" y="5" width="4" height="4" fill="#f97373" />
                  <rect x="5" y="7" width="6" height="4" fill="#f97373" />
                  <rect x="5" y="11" width="2" height="2" fill="#f97373" />
                  <rect x="9" y="11" width="2" height="2" fill="#f97373" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl text-left flex-1">
            <h1
              ref={headlineRef}
              className="font-hero-vitalyn mt-6 max-w-xl text-6xl sm:text-7xl lg:text-[4.6rem] leading-[1.02] font-extrabold tracking-tight text-[#fdfbf6]"
            >
              <span className="block text-[#f1ede2]/90 text-xl sm:text-2xl tracking-[0.28em] uppercase">
                Vitalyn
              </span>
              <span className="mt-3 block">
                Post‑op
                <span className="block text-4xl sm:text-5xl lg:text-[3.5rem] text-[#f1ede2]">
                  Multimodal Risk Radar
                </span>
              </span>
              <span className="mt-3 block text-xl sm:text-2xl text-[#f1ede2]/80">
                Catches deterioration hours before the ward sees it.
              </span>
            </h1>

            <p
              ref={subRef}
              className="mt-6 max-w-md text-sm sm:text-base leading-relaxed text-[#f1ede2]/80"
            >
              Vitalyn watches vitals, face and voice to surface the next risk
              before it surfaces in the ward. Built for clinicians, not dashboards.
            </p>

            <div
              ref={ctaRef}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
            >
              <Link to="/login">
                <Button className="h-12 px-8 text-sm sm:text-base bg-gradient-to-r from-[#f1ede2] to-[#e0d9c9] hover:from-[#ffffff] hover:to-[#f1ede2] text-[#3a3e61] font-semibold shadow-lg shadow-[#3a3e61]/25 rounded-full">
                  <User className="mr-2 h-5 w-5" />
                  Enter live demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/patient">
                <Button
                  variant="outline"
                  className="h-12 px-6 text-sm sm:text-base rounded-full border-[#f1ede2]/70 bg-[#3a3e61]/40 text-[#f1ede2] hover:bg-[#3a3e61]/70 hover:border-[#f1ede2]"
                >
                  <Stethoscope className="mr-2 h-5 w-5" />
                  View patient-side screen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#f1ede2] sm:text-4xl">
              Engineered for Clinical Excellence
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#f1ede2]/75">
              A comprehensive system that transforms raw data into lifesaving insights.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "Multimodal Fusion",
                desc: "Combines wearable vitals, facial micro-expressions, and voice stress analysis for 360° patient monitoring.",
                icon: Activity,
                color: "text-[#3a3e61]",
                bg: "bg-[#f1ede2]/80",
              },
              {
                title: "Predictive TTR Engine",
                desc: "Proprietary Time-to-Risk algorithms forecast deterioration hours before clinical symptoms appear.",
                icon: Clock,
                color: "text-[#3a3e61]",
                bg: "bg-[#f1ede2]/80",
              },
              {
                title: "Smart Queue Optimization",
                desc: "Dynamic hospital resource allocation based on medical urgency rather than first-come-first-serve.",
                icon: Zap,
                color: "text-[#3a3e61]",
                bg: "bg-[#f1ede2]/80",
              },
            ].map((feature) => (
              <Card key={feature.title} className="bg-[#f1ede2]/90 border-[#e1d8c7] backdrop-blur-sm hover:bg-[#ffffff] transition-colors">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.bg} ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-[#3a3e61]">{feature.title}</CardTitle>
                  <CardDescription className="text-[#3a3e61]/80 mt-2">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#3a3e61] via-[#4a4f74] to-[#f1ede2] px-6 py-16 shadow-2xl sm:px-16 lg:flex lg:gap-x-20 lg:px-24">
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-8 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-[#f1ede2] sm:text-4xl">
              Ready to transform healthcare?
              <br />
              Start using Vitalyn today.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#f1ede2]/80">
              Join the network of forward-thinking hospitals and empower your patients with the future of recovery monitoring.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-[#f1ede2] to-[#e0d9c9] hover:from-[#ffffff] hover:to-[#f1ede2] text-[#3a3e61]">
                  Get Started
                </Button>
              </Link>
              <Link to="/patient">
                <Button size="lg" variant="outline" className="border-[#f1ede2]/70 bg-transparent text-[#f1ede2] hover:bg-[#f1ede2]/10 hover:text-[#3a3e61] backdrop-blur-sm">
                  View Patient Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-[#3a3e61] via-[#4a4f74] to-[#3a3e61] border-t border-[#f1ede2]/20 text-[#f1ede2]/80 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-[#f1ede2]" />
            <span className="text-lg font-bold text-[#f1ede2]">Vitalyn</span>
          </div>
          <p className="text-sm text-[#f1ede2]/80">&copy; 2024 Vitalyn. Built for Healthcare Innovation.</p>
        </div>
      </footer>
    </div>
  );
}
