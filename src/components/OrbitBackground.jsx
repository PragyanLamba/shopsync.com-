import { motion } from 'framer-motion'

export default function OrbitBackground() {
  const innerRingSites = [
    { name: 'Amazon', domain: 'amazon.in', pos: { left: '50%', top: '0%' } },
    { name: 'Flipkart', domain: 'flipkart.com', pos: { left: '50%', top: '100%' } }
  ]

  const middleRingSites = [
    { name: 'Myntra', domain: 'myntra.com', pos: { left: '50%', top: '0%' } },
    { name: 'Nike', domain: 'nike.com', pos: { left: '93.3%', top: '75%' } },
    { name: 'Croma', domain: 'croma.com', pos: { left: '6.7%', top: '75%' } }
  ]

  const outerRingSites = [
    { name: 'Campus', domain: 'campusshoes.com', pos: { left: '50%', top: '0%' } },
    { name: 'Adidas', domain: 'adidas.co.in', pos: { left: '100%', top: '50%' } },
    { name: 'Puma', domain: 'in.puma.com', pos: { left: '50%', top: '100%' } },
    { name: 'Reliance', domain: 'reliancedigital.in', pos: { left: '0%', top: '50%' } }
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
      {/* Styles for Orbit Animations */}
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes counter-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes counter-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-orbit-cw {
          animation: orbit-cw 40s linear infinite;
        }
        .animate-counter-cw {
          animation: counter-cw 40s linear infinite;
        }

        .animate-orbit-ccw {
          animation: orbit-ccw 55s linear infinite;
        }
        .animate-counter-ccw {
          animation: counter-ccw 55s linear infinite;
        }

        .animate-orbit-outer {
          animation: orbit-cw 75s linear infinite;
        }
        .animate-counter-outer {
          animation: counter-cw 75s linear infinite;
        }

        .orbit-interactive {
          pointer-events: auto;
        }

        /* Pause orbit and counter-rotation when hovered */
        .orbit-group:hover,
        .orbit-group:hover .orbit-child {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Orbit Container with Perspective Scaling */}
      <div className="relative w-[900px] h-[900px] flex items-center justify-center scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-[1.0] transition-transform duration-500 opacity-40">
        
        {/* Glow ambient background center */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />

        {/* ================= INNER ORBIT (Ring 1) ================= */}
        <div className="orbit-group orbit-interactive absolute w-[300px] h-[300px] rounded-full border border-primary/20 border-dashed animate-orbit-cw flex items-center justify-center">
          {innerRingSites.map((site, index) => (
            <div
              key={index}
              className="absolute w-12 h-12 flex items-center justify-center"
              style={{
                left: site.pos.left,
                top: site.pos.top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="orbit-child animate-counter-cw flex items-center justify-center w-12 h-12 rounded-full glass border border-primary/40 hover:border-accent hover:scale-110 shadow-lg shadow-primary/20 hover:shadow-accent/40 cursor-help transition-all duration-300 group">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=128`}
                  alt={site.name}
                  onError={(e) => { e.target.src = 'https://www.google.com/favicon.ico' }}
                  className="w-6 h-6 object-contain rounded-md"
                />
                {/* Tooltip name */}
                <span className="absolute -bottom-8 px-2 py-0.5 text-[10px] font-bold bg-black/80 text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {site.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MIDDLE ORBIT (Ring 2) ================= */}
        <div className="orbit-group orbit-interactive absolute w-[560px] h-[560px] rounded-full border border-accent/20 animate-orbit-ccw flex items-center justify-center">
          {middleRingSites.map((site, index) => (
            <div
              key={index}
              className="absolute w-12 h-12 flex items-center justify-center"
              style={{
                left: site.pos.left,
                top: site.pos.top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="orbit-child animate-counter-ccw flex items-center justify-center w-12 h-12 rounded-full glass border border-accent/40 hover:border-secondary hover:scale-110 shadow-lg shadow-accent/20 hover:shadow-secondary/40 cursor-help transition-all duration-300 group">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=128`}
                  alt={site.name}
                  onError={(e) => { e.target.src = 'https://www.google.com/favicon.ico' }}
                  className="w-6 h-6 object-contain rounded-md"
                />
                {/* Tooltip name */}
                <span className="absolute -bottom-8 px-2 py-0.5 text-[10px] font-bold bg-black/80 text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {site.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= OUTER ORBIT (Ring 3) ================= */}
        <div className="orbit-group orbit-interactive absolute w-[820px] h-[820px] rounded-full border border-secondary/10 border-dashed animate-orbit-outer flex items-center justify-center">
          {outerRingSites.map((site, index) => (
            <div
              key={index}
              className="absolute w-12 h-12 flex items-center justify-center"
              style={{
                left: site.pos.left,
                top: site.pos.top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="orbit-child animate-counter-outer flex items-center justify-center w-12 h-12 rounded-full glass border border-secondary/30 hover:border-accent hover:scale-110 shadow-lg shadow-secondary/10 hover:shadow-accent/40 cursor-help transition-all duration-300 group">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=128`}
                  alt={site.name}
                  onError={(e) => { e.target.src = 'https://www.google.com/favicon.ico' }}
                  className="w-6 h-6 object-contain rounded-md"
                />
                {/* Tooltip name */}
                <span className="absolute -bottom-8 px-2 py-0.5 text-[10px] font-bold bg-black/80 text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {site.name}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
