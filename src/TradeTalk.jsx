import React, { useState, useEffect, useRef } from 'react';

// Popular Base tokens (expandable later)
const BASE_TOKENS = [
  { symbol: "ETH", name: "Ethereum", price: 2456.78, change: 2.34, type: "bluechip" },
  { symbol: "USDC", name: "USD Coin", price: 0.9998, change: 0.01, type: "stable" },
  { symbol: "DAI", name: "Dai Stablecoin", price: 1.0001, change: 0.02, type: "stable" },
  { symbol: "WETH", name: "Wrapped Ether", price: 2455.12, change: 2.31, type: "bluechip" },
  { symbol: "BRETT", name: "Brett", price: 0.0065, change: 4.82, type: "meme" },
  { symbol: "TOSHI", name: "Toshi", price: 0.000416, change: 7.35, type: "meme" },
  { symbol: "DEGEN", name: "Degen", price: 0.00093, change: 12.4, type: "meme" },
  { symbol: "MIGGLES", name: "Mr. Miggles", price: 0.095, change: -3.2, type: "meme" },
  { symbol: "SKI", name: "Ski Mask Dog", price: 0.0056, change: 5.1, type: "meme" },
  { symbol: "AERO", name: "Aerodrome", price: 0.87, change: 3.45, type: "defi" },
  { symbol: "MORPHO", name: "Morpho", price: 1.84, change: 1.9, type: "defi" },
  { symbol: "LINK", name: "Chainlink", price: 7.91, change: -1.2, type: "bluechip" },
];

export default function TradeTalk() {
  const [prices, setPrices] = useState(BASE_TOKENS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, user: "Luna", text: "I'm connected to Base MCP. Search any token and trade it with sponsored gas. What do you want to do?", time: "just now" }
  ]);
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [tips, setTips] = useState(1240);
  const [isMobile, setIsMobile] = useState(false);
  const [showTradePanel, setShowTradePanel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(token => ({
        ...token,
        price: token.price * (1 + (Math.random() - 0.5) * 0.008),
        change: parseFloat((token.change + (Math.random() - 0.5) * 0.8).toFixed(2))
      })));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Canvas Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = particlesRef.current;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const create = () => {
      particles.length = 0;
      const count = isMobile ? 45 : 70;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 2.2 + 0.8,
          opacity: Math.random() * 0.5 + 0.25
        });
      }
    };
    create();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94a3b8';
      for (let p of particles) {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.globalAlpha = (1 - dist / 140) * 0.35;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMobile]);

  // Filtered tokens based on search
  const filteredTokens = prices.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open trade panel for a token
  const openTrade = (token) => {
    setSelectedToken(token);
    setTradeAmount("");
    setEstimatedOutput("");
    setShowTradePanel(true);
  };

  // Simple simulated swap calculation
  const calculateSwap = (amount) => {
    if (!selectedToken || !amount) {
      setEstimatedOutput("");
      return;
    }
    const fromToken = prices.find(t => t.symbol === "USDC") || prices[1];
    const rate = fromToken.price / selectedToken.price;
    const output = (parseFloat(amount) * rate).toFixed(4);
    setEstimatedOutput(output);
  };

  const executeTrade = () => {
    if (!selectedToken || !tradeAmount) return;
    setIsProcessing(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: "Luna",
        text: `Trade executed! Swapped ${tradeAmount} USDC → ${estimatedOutput} ${selectedToken.symbol}. Gas was sponsored by Base Paymaster.`,
        time: "now"
      }]);
      setShowTradePanel(false);
      setTradeAmount("");
      setEstimatedOutput("");
      setIsProcessing(false);
      // Give user some tips for trading
      setTips(prev => prev + 25);
    }, 900);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), user: "You", text: input, time: "now" }]);
    setInput("");
  };

  const handleShareAlpha = () => {
    const text = "Just shipped TradeTalk v0.4 on Base — now with full token discovery + trade flow. https://tradetalk-ten.vercel.app";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setTips(prev => prev + 50);
  };

  const connectWallet = () => {
    setWalletConnected(true);
    alert("Wallet connected (Demo)");
  };

  const glassStyle = {
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(148, 163, 184, 0.15)"
  };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
      
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }} />

      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0,
        background: "linear-gradient(-45deg, #05070f, #0a0f1e, #0f172a, #1e1135)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 32s ease infinite",
        opacity: 0.85
      }} />

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: isMobile ? "14px 16px" : "18px 28px", borderBottom: "1px solid #1a2332", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: "14px", position: "relative", zIndex: 2 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", letterSpacing: "-0.6px" }}>TradeTalk</h1>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>Social Trading on Base</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          <button onClick={handleShareAlpha} style={{ flex: isMobile ? 1 : "none", background: "#22c55e", color: "#000", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "14.5px" }}>
            Share Alpha → Earn Tips
          </button>
          <button onClick={connectWallet} style={{ flex: isMobile ? 1 : "none", background: walletConnected ? "#166534" : "#1e2937", color: "#fff", border: "1px solid #334155", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", fontSize: "14.5px" }}>
            {walletConnected ? "✓ Connected" : "Connect Wallet"}
          </button>
        </div>
      </div>

      <div style={{ padding: isMobile ? "18px 16px" : "28px 28px", maxWidth: "1180px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        {/* Live Prices + Search */}
        <div style={{ marginBottom: isMobile ? "22px" : "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#94a3b8" }}>Tokens on Base</div>
            <input
              type="text"
              placeholder="Search tokens (BRETT, TOSHI, AERO...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "#1e2937", border: "1px solid #334155", borderRadius: "10px", padding: "10px 16px", color: "#fff", width: isMobile ? "100%" : "280px", fontSize: "14.5px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px" }}>
            {filteredTokens.map((token) => (
              <div key={token.symbol} style={{ ...glassStyle, borderRadius: "14px", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700" }}>{token.symbol}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{token.name}</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "6px" }}>
                      ${token.price.toFixed(token.price < 1 ? 6 : 2)}
                    </div>
                  </div>
                  <div style={{ color: token.change >= 0 ? "#22c55e" : "#ef4444", fontWeight: "700", fontSize: "14px" }}>
                    {token.change >= 0 ? "+" : ""}{token.change}%
                  </div>
                </div>
                <button 
                  onClick={() => openTrade(token)}
                  style={{ marginTop: "14px", width: "100%", background: "#3b82f6", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", fontWeight: "700", fontSize: "14.5px" }}
                >
                  Trade {token.symbol}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Chat + Sidebar */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px" }}>
          
          {/* Chat */}
          <div style={{ flex: 1, ...glassStyle, borderRadius: "18px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: isMobile ? "440px" : "500px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)", fontWeight: "600", fontSize: "15.5px" }}>
              Live Trading Chat — Luna (Base MCP)
            </div>
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
              {messages.map(msg => (
                <div key={msg.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                    <strong style={{ color: msg.user === "Luna" ? "#60a5fa" : "#22c55e", fontSize: "15px" }}>{msg.user}</strong>
                    <span style={{ fontSize: "12px", color: "#475569" }}>{msg.time}</span>
                  </div>
                  <div style={{ color: "#e2e8f0", fontSize: "15.5px", lineHeight: "1.55" }}>{msg.text}</div>
                </div>
              ))}
              {isProcessing && <div style={{ color: "#64748b", fontSize: "14px" }}>Executing trade with sponsored gas...</div>}
            </div>
            <div style={{ padding: "15px 18px", borderTop: "1px solid rgba(148, 163, 184, 0.12)", display: "flex", gap: "10px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSend()} placeholder="Ask Luna anything..." style={{ flex: 1, background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", padding: "14px 18px", color: "#fff", fontSize: "15.5px", outline: "none" }} />
              <button onClick={handleSend} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0 26px", borderRadius: "12px", fontWeight: "700", fontSize: "15.5px" }}>Send</button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: isMobile ? "100%" : "360px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ ...glassStyle, borderRadius: "18px", padding: "24px 26px" }}>
              <div style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "8px" }}>Your Tips Balance</div>
              <div style={{ fontSize: "38px", fontWeight: "700", marginBottom: "18px" }}>{tips}</div>
              <button onClick={handleShareAlpha} style={{ width: "100%", background: "#22c55e", color: "#000", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "700", fontSize: "15.5px" }}>
                Share Alpha → Earn More Tips
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Panel Modal */}
      {showTradePanel && selectedToken && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ ...glassStyle, borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>Trade {selectedToken.symbol}</div>
                <div style={{ color: "#64748b", fontSize: "14px" }}>{selectedToken.name}</div>
              </div>
              <button onClick={() => setShowTradePanel(false)} style={{ background: "transparent", color: "#fff", border: "none", fontSize: "24px" }}>×</button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>You Pay (USDC)</div>
              <input 
                type="number" 
                value={tradeAmount} 
                onChange={(e) => { setTradeAmount(e.target.value); calculateSwap(e.target.value); }}
                placeholder="0.00" 
                style={{ width: "100%", background: "#1e2937", border: "1px solid #334155", borderRadius: "12px", padding: "14px 18px", color: "#fff", fontSize: "20px" }} 
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>You Receive (estimated)</div>
              <div style={{ background: "#1e2937", border: "1px solid #334155", borderRadius: "12px", padding: "14px 18px", fontSize: "20px", color: estimatedOutput ? "#22c55e" : "#64748b" }}>
                {estimatedOutput || "0.00"} {selectedToken.symbol}
              </div>
            </div>

            <button 
              onClick={executeTrade} 
              disabled={!tradeAmount || isProcessing}
              style={{ width: "100%", background: "#22c55e", color: "#000", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "700", fontSize: "16px", opacity: (!tradeAmount || isProcessing) ? 0.6 : 1 }}
            >
              {isProcessing ? "Executing with Sponsored Gas..." : `Execute Trade (Gas Sponsored)`}
            </button>

            <div style={{ textAlign: "center", marginTop: "14px", fontSize: "13px", color: "#64748b" }}>
              Gas fees sponsored by Base Paymaster
            </div>
          </div>
        </div>
      )}
    </div>
  );
}