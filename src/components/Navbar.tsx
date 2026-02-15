import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import gsap from "gsap";

export function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!navRef.current) return;

    const ctx = gsap.context(() => {
      if (navRef.current) {
        gsap.fromTo(
          navRef.current,
          { y: -40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      }

      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, delay: 0.2, ease: "power3.out" }
        );
      }

      if (linksRef.current) {
        gsap.fromTo(
          linksRef.current.children,
          { y: 10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.3,
            ease: "power2.out",
            stagger: 0.05,
          }
        );
      }

      if (actionsRef.current) {
        gsap.fromTo(
          actionsRef.current.children,
          { y: 10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.35,
            ease: "power2.out",
            stagger: 0.08,
          }
        );
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 bg-gradient-to-b from-[#3a3e61]/95 via-[#3a3e61]/85 to-transparent border-b border-white/5 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div ref={logoRef} className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl bg-[#f1ede2]/60 border border-white/40 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-[1px] rounded-lg bg-[#3a3e61]" />
              <BrainCircuit className="relative h-5 w-5 text-[#f1ede2]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#f1ede2]">
                Vitalyn
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#f1ede2]/70">
                Multimodal Care Engine
              </span>
            </div>
          </div>

          <div
            ref={linksRef}
            className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide"
          >
            <Link
              to="/"
              className="text-[#f1ede2]/70 hover:text-[#f1ede2] transition-colors"
            >
              Overview
            </Link>
            <Link
              to="/post-op"
              className="text-[#f1ede2]/70 hover:text-[#f1ede2] transition-colors"
            >
              Post-op
            </Link>
            <Link
              to="/opd-queue"
              className="text-[#f1ede2]/70 hover:text-[#f1ede2] transition-colors"
            >
              CareQueue
            </Link>
            <Link
              to="/alerts"
              className="text-[#f1ede2]/70 hover:text-[#f1ede2] transition-colors"
            >
              Alerts
            </Link>
          </div>

          <div ref={actionsRef} className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-[#f1ede2]/80 hover:text-[#3a3e61] hover:bg-[#f1ede2]/80 border border-transparent hover:border-[#f1ede2]/60"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-[#f1ede2] to-[#e0d7c4] hover:from-[#ffffff] hover:to-[#f1ede2] text-[#3a3e61] shadow-lg shadow-[#3a3e61]/20 text-sm px-4">
                Launch Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
