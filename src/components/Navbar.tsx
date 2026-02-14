
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600/20 p-2">
              <BrainCircuit className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Vitalyn</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/opd-queue">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                Doctor Login
              </Button>
            </Link>
            <Link to="/patient">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                Patient Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
