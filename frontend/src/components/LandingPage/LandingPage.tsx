import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="antialiased min-h-screen flex flex-col selection:bg-[#00f5ff]/30 selection:text-[#a5faff] bg-[#020617] text-[#e1e6ff] font-['Manrope',sans-serif]">
      {/* Custom Styles */}
      <style>{`
        h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
        .glass-nav { background-color: rgba(2, 6, 23, 0.6); backdrop-filter: blur(20px); }
        .gradient-btn { background: linear-gradient(135deg, #00f5ff, #008fa0); }
        .neon-glow { text-shadow: 0 0 15px rgba(0, 245, 255, 0.4); }
        .btn-glow { box-shadow: 0 0 20px 0 rgba(0, 245, 255, 0.2); }
      `}</style>

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl bg-gradient-to-b from-slate-900/50 to-transparent shadow-2xl shadow-cyan-900/10 transition-all duration-300 hover:bg-slate-900/40">
        <div className="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto tracking-tight">
          <div className="text-2xl font-bold tracking-tighter text-slate-100 flex items-center gap-2 font-['Space_Grotesk']">
            <span className="material-symbols-outlined text-cyan-400">scatter_plot</span>
            Quantum-AI Verse
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onEnter}
              className="gradient-btn text-[#00363a] rounded-full px-6 py-2 font-medium tracking-wide btn-glow hover:brightness-110 transition-all duration-300 text-sm"
            >
              Initialize Link
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-slate-950">
          <img
            alt="Cinematic space background"
            className="w-full h-full object-cover mix-blend-screen brightness-100 contrast-125 saturate-200 opacity-100"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQfZtRw7RkkrnQPYSoMOC6v2rzUJZEhOuUuNxBrQM0Wd8CZjnGZSA0CJZAzefnNjKZvlMsmgakE8GTKMIOvYexXe7uDP1jk4R1rVb_KaBceJKudiXEsO_XRhPmB9Msr3ZrrXt9Ej9lBCI9qJse7LpCzxRNu3i_25xji2F72_jDv9LbJnMS7UNtTILkjJXIMLGTrmdFHhewiy99DNTb7U8vajGUXDAGUdNOiHP42kthoHR6-rhXxBl2UFvstdmgs5gasATEK58q5g"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent"></div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-[921px] px-6 pt-32 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e2437]/40 border border-[#35363d]/15 backdrop-blur-xl mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse"></span>
              <span className="font-['Manrope'] text-xs tracking-[0.1em] uppercase text-[#b6b6bd]">System Online v2.4</span>
            </div>

            <h1 className="font-['Space_Grotesk'] text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#e1e6ff] leading-[1.1] neon-glow">
              Quantum-AI Verse
            </h1>

            <p className="font-['Manrope'] text-xl md:text-2xl text-[#b6b6bd] max-w-2xl mx-auto font-light">
              Bridging AI and Quantum Computing. Experience the celestial singularity where fluid intelligence meets infinite scale.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <button
                onClick={onEnter}
                className="text-[#00f5ff] hover:text-[#a5faff] transition-colors duration-300 font-medium px-8 py-4 flex items-center gap-2 group relative text-lg"
              >
                <span className="relative z-10">Commence Uplink</span>
                <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="relative z-10 bg-[#020617] py-32 px-6">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#0a0f1e] border border-[#1e2437] rounded-xl p-8 hover:bg-[#151b2d] transition-colors duration-500 group relative overflow-hidden h-[400px] md:col-span-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <span className="material-symbols-outlined text-[#00f5ff] text-4xl mb-4">hub</span>
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-3xl font-semibold mb-3 text-[#e1e6ff]">Agent Intelligence</h3>
                    <p className="font-['Manrope'] text-[#b6b6bd] text-lg">Autonomous AI agents capable of navigating complex quantum probability spaces to solve multi-dimensional problems.</p>
                  </div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-[#0a0f1e] border border-[#1e2437] rounded-xl p-8 hover:bg-[#151b2d] transition-colors duration-500 group relative overflow-hidden h-[400px]">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <span className="material-symbols-outlined text-[#d0bcff] text-4xl mb-4">memory</span>
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-2xl font-semibold mb-3 text-[#e1e6ff]">Quantum Scalability</h3>
                    <p className="font-['Manrope'] text-[#b6b6bd]">Leveraging quantum entanglement and superposition to achieve computational speeds that scale exponentially with agent density.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/30 w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 font-['Manrope'] text-xs uppercase tracking-[0.2em] relative z-20">
        <div className="text-lg font-black text-slate-200">
          <span className="material-symbols-outlined text-[#00f5ff] align-middle mr-2">scatter_plot</span>
          Quantum-AI Verse
        </div>
        <div className="text-slate-500">
          © 2026 Quantum-AI Verse. The Agent Swarm Protocol.
        </div>
      </footer>
    </div>
  );
}
