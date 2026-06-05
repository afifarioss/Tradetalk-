import React, { useState, useEffect, useRef } from 'react';

// ============================================
// BASE MCP SIMULATION LAYER (Ready for real integration)
// ============================================
const mockMCPActions = {
  checkPortfolio: async () => {
    return {
      success: true,
      data: {
        eth: "1.24",
        usdc: "342.50",
        totalUSD: "2847.32"
      }
    };
  },
  
  suggestSwap: async (from, to) => {
    return {
      success: true,
      suggestion: `Swap 0.5 ETH → ${to}`,
      estimatedOutput: "1243.67 USDC",
      gasSponsored: true
    };
  },

  sendTip: async (amount, to) => {
    return {
      success: true,
      txHash: "0x" + Math.random().toString(16).slice(2, 10),
      message: `Sent ${amount} tips to ${to} (gas sponsored)`
    };
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function TradeTalk() {
  const [prices, setPrices] = useState({
    ETH: { price: 2456.78, change: 2.34 },
    BTC: { price: 67234.56, change: -1.23 },
    BASE: { price: 0.00001234, change: 5.67 }
  });

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      user: "Luna", 
      text: "I'm now connected to Base MCP. I can check your portfolio, suggest swaps, and help you execute actions with sponsored gas. What would you like to do?", 
      time: "just now",
      type: "text"
    }
  ]);
  
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [tips, setTips] = useState(1240);
  const [isMobile, setIsMobile] = useState(false);
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

  // Live prices
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        ETH: { ...prev.ETH, price: prev.ETH.price + (Math.random() - 0.5) * 2.8 },
        BTC: { ...prev.BTC, price: prev.BTC.price + (Math.random() - 0.5) * 28 },
        BASE: { ...prev.BASE, price: prev.BASE.price + (Math.random() - 0.5) * 0.0000006 }
      }));
    }, 6800);
    return () => clearInterval(interval);
  }, []);

  // Canvas Particles (same as before)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = particlesRef.current;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticles = () => {
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
    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94a3b8';
      
      for (let p of particles) {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

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
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMobile]);

  // ============================================
  // BASE MCP + GAS SPONSORSHIP HANDLER
  // ============================================
  const handleMCPAction = async (actionType) => {
    setIsProcessing(true);

    let responseText = "";
    let actionData = null;

    try {
      if (actionType === "checkPortfolio") {
        const result = await mockMCPActions.checkPortfolio();
        responseText = `Your current portfolio: ${result.data.eth} ETH + ${result.data.usdc} USDC (≈ $${result.data.totalUSD})`;
        actionData = result.data;
      } 
      
      else if (actionType === "suggestSwap") {
        const result = await mockMCPActions.suggestSwap("ETH", "USDC");
        responseText = `I suggest: \( {result.suggestion} → You would receive \~ \){result.estimatedOutput}. Gas will be sponsored.`;
        actionData = result;
      } 
      
      else if (actionType === "sendTip") {
        const result = await mockMCPActions.sendTip("50", "@afifarioss");
        responseText = `Tip sent successfully! Tx: ${result.txHash}. Gas was sponsored by Base Paymaster.`;
        actionData = result;
      }

      // Add Luna's response
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: "Luna",
        text: responseText,
        time: "now",
        type: "mcp",
        actionData
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: "Luna",
        text: "Sorry, there was an error connecting to Base MCP. Please try again.",
        time: "now"
      }]);
    }

    setIsProcessing(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      user: "You",
      text: input,
      time: "now"
    }]);

    // Simple intent detection for MCP
    const lowerInput = input.toLowerCase();
    
    setTimeout(() => {
      if (lowerInput.includes("portfolio") || lowerInput.includes("balance")) {
        handleMCPAction("checkPortfolio");
      } 
      else if (lowerInput.includes("swap") || lowerInput.includes("trade")) {
        handleMCPAction("suggestSwap");
      } 
      else if (lowerInput.includes("tip") || lowerInput.includes("send")) {
        handleMCPAction("sendTip");
      } 
      else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          user: "Luna",
          text: "I can help you check portfolio, suggest swaps, or send tips using Base MCP with sponsored gas. Try saying 'check my portfolio' or 'suggest a swap'.",
          time: "now"
        }]);
      }
    }, 700);

    setInput("");
  };

  const handleShareAlpha = () => {
    const text = "Just shipped TradeTalk v0.4 on Base — now powered by Base MCP + Gas Sponsorship. https://tradetalk-ten.vercel.app";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setTips(prev => prev + 50);
    alert("Thanks for sharing! +50 tips added.");
  };

  const connectWallet = () => {
    setWalletConnected(true);
    alert("Wallet connected! (Demo mode - real wagmi integration coming next)");
  };

  const glassStyle = {
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(148, 163, 184, 0.15)"
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      color: "#fff", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Canvas Particles */}
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* Animated Gradient */}
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
      <div style={{ 
        padding: isMobile ? "14px 16px" : "18px 28px", 
        borderBottom: "1px solid #1a2332",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        gap: "14px",
        position: "relative",
        zIndex: 2
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", letterSpacing: "-0.6px" }}>TradeTalk</h1>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>Social Trading Mini-App on Base</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          <button onClick={handleShareAlpha} style={{
            flex: isMobile ? 1 : "none",
            background: "#22c55e", color: "#000", border: "none",
            padding: "12px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "14.5px"
          }}>
            Share Alpha → Earn Tips
          </button>

          <button onClick={connectWallet} style={{
            flex: isMobile ? 1 : "none",
            background: walletConnected ? "#166534" : "#1e2937",
            color: "#fff", border: "1px solid #334155",
            padding: "12px 20px", borderRadius: "10px", fontWeight: "600", fontSize: "14.5px"
          }}>
            {walletConnected ? "✓ Wallet Connected" : "Connect Wallet"}
          </button>
        </div>
      </div>

      <div style={{ padding: isMobile ? "18px 16px" : "28px 28px", maxWidth: "1120px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        {/* Live Prices */}
        <div style={{ marginBottom: isMobile ? "22px" : "30px" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#94a3b8", paddingLeft: "4px" }}>
            Live Prices on Base
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            {Object.entries(prices).map(([symbol, data]) => (
              <div key={symbol} style={{ ...glassStyle, borderRadius: "16px", padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>{symbol}</div>
                    <div style={{ fontSize: "23px", fontWeight: "700", letterSpacing: "-0.4px" }}>
                      ${data.price.toFixed(symbol === "BASE" ? 8 : 2)}
                    </div>
                  </div>
                  <div style={{ color: data.change >= 0 ? "#22c55e" : "#ef4444", fontWeight: "700", fontSize: "15px", paddingTop: "5px" }}>
                    {data.change >= 0 ? "+" : ""}{data.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", alignItems: "flex-start" }}>
          
          {/* Chat */}
          <div style={{ flex: 1, ...glassStyle, borderRadius: "18px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: isMobile ? "440px" : "500px", width: "100%" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)", fontWeight: "600", fontSize: "15.5px" }}>
              Live Trading Chat <span style={{ color: "#64748b", fontWeight: "400" }}>— Luna (Base MCP Agent)</span>
            </div>

            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
              {messages.map(msg => (
                <div key={msg.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                    <strong style={{ color: msg.user === "Luna" ? "#60a5fa" : "#22c55e", fontSize: "15px" }}>{msg.user}</strong>
                    <span style={{ fontSize: "12px", color: "#475569" }}>{msg.time}</span>
                  </div>
                  <div style={{ color: "#e2e8f0", fontSize: "15.5px", lineHeight: "1.55" }}>
                    {msg.text}
                  </div>
                  {msg.type === "mcp" && msg.actionData && (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
                      (Base MCP + Gas Sponsored)
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div style={{ color: "#64748b", fontSize: "14px" }}>Luna is processing via Base MCP...</div>
              )}
            </div>

            <div style={{ padding: "15px 18px", borderTop: "1px solid rgba(148, 163, 184, 0.12)", display: "flex", gap: "10px" }}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSend()}
                placeholder="Try: check portfolio, suggest swap, or send tip"
                style={{ flex: 1, background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", padding: "14px 18px", color: "#fff", fontSize: "15.5px", outline: "none" }}
              />
              <button onClick={handleSend} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0 26px", borderRadius: "12px", fontWeight: "700", fontSize: "15.5px" }}>
                Send
              </button>
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

            <div style={{ ...glassStyle, borderRadius: "18px", padding: "22px 26px" }}>
              <div style={{ fontWeight: "600", marginBottom: "16px", fontSize: "15px" }}>Quick MCP Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={() => handleMCPAction("checkPortfolio")} style={{ background: "#1e2937", color: "#fff", border: "1px solid #334155", padding: "12px", borderRadius: "10px", fontSize: "14.5px" }}>
                  Check My Portfolio
                </button>
                <button onClick={() => handleMCPAction("suggestSwap")} style={{ background: "#1e2937", color: "#fff", border: "1px solid #334155", padding: "12px", borderRadius: "10px", fontSize: "14.5px" }}>
                  Suggest a Swap
                </button>
                <button onClick={() => handleMCPAction("sendTip")} style={{ background: "#1e2937", color: "#fff", border: "1px solid #334155", padding: "12px", borderRadius: "10px", fontSize: "14.5px" }}>
                  Send 50 Tips (Gas Sponsored)
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}