Improve UI: cleaner mobile layout, better chat, premium dark themeimport React, { useState, useEffect } from 'react';

export default function TradeTalk() {
  const [prices, setPrices] = useState({
    ETH: { price: 2456.78, change: 2.34 },
    BTC: { price: 67234.56, change: -1.23 },
    BASE: { price: 0.00001252, change: 5.67 }
  });

  const [messages, setMessages] = useState([
    { id: 1, user: "Luna", text: "Welcome to TradeTalk on Base. How can I help you today?", time: "just now" }
  ]);
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [tips, setTips] = useState(1340);

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        ETH: { ...prev.ETH, price: prev.ETH.price + (Math.random() - 0.5) * 3 },
        BTC: { ...prev.BTC, price: prev.BTC.price + (Math.random() - 0.5) * 30 },
        BASE: { ...prev.BASE, price: prev.BASE.price + (Math.random() - 0.5) * 0.0000008 }
      }));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      user: "You",
      text: input,
      time: "now"
    }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        user: "Luna",
        text: "Thanks! I'm analyzing the market for you right now...",
        time: "now"
      }]);
    }, 700);

    setInput("");
  };

  const handleShareAlpha = () => {
    const text = "Just shipped TradeTalk v0.4 on Base — live prices + MCP AI agents + Share Alpha tips. https://tradetalk-ten.vercel.app";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setTips(prev => prev + 50);
    alert("Thanks for sharing! +50 tips added to your balance.");
  };

  const connectWallet = () => {
    setWalletConnected(true);
    alert("Wallet connected successfully! (Demo mode)");
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#05070f", 
      color: "#fff", 
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Header */}
      <div style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid #1a2332",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", letterSpacing: "-0.5px" }}>TradeTalk</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Social Trading Mini-App on Base</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button 
            onClick={handleShareAlpha}
            style={{
              background: "#22c55e",
              color: "#000",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Share Alpha → Earn Tips
          </button>

          <button 
            onClick={connectWallet}
            style={{
              background: walletConnected ? "#166534" : "#1e2937",
              color: "#fff",
              border: "1px solid #334155",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {walletConnected ? "✓ Wallet Connected" : "Connect Wallet"}
          </button>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Live Prices */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "12px", color: "#94a3b8" }}>
            Live Prices on Base
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
            gap: "14px" 
          }}>
            {Object.entries(prices).map(([symbol, data]) => (
              <div key={symbol} style={{
                background: "#0f172a",
                border: "1px solid #1e2937",
                borderRadius: "14px",
                padding: "16px 18px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>{symbol}</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", marginTop: "6px", letterSpacing: "-0.3px" }}>
                      ${data.price.toFixed(symbol === "BASE" ? 8 : 2)}
                    </div>
                  </div>
                  <div style={{ 
                    color: data.change >= 0 ? "#22c55e" : "#ef4444", 
                    fontWeight: "700",
                    fontSize: "14px",
                    paddingTop: "4px"
                  }}>
                    {data.change >= 0 ? "+" : ""}{data.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Chat + Sidebar */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 340px", 
          gap: "18px",
          alignItems: "start"
        }}>
          
          {/* Chat Panel */}
          <div style={{ 
            background: "#0f172a", 
            border: "1px solid #1e2937", 
            borderRadius: "16px", 
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "460px"
          }}>
            <div style={{ 
              padding: "14px 18px", 
              borderBottom: "1px solid #1e2937", 
              fontWeight: "600",
              fontSize: "15px"
            }}>
              Live Trading Chat <span style={{ color: "#64748b", fontWeight: "400" }}>— Luna (AI Agent)</span>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              padding: "18px", 
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              {messages.map(msg => (
                <div key={msg.id}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <strong style={{ 
                      color: msg.user === "Luna" ? "#60a5fa" : "#22c55e",
                      fontSize: "14px"
                    }}>
                      {msg.user}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#475569" }}>{msg.time}</span>
                  </div>
                  <div style={{ 
                    color: "#e2e8f0", 
                    fontSize: "14.5px",
                    lineHeight: "1.45"
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ 
              padding: "14px 16px", 
              borderTop: "1px solid #1e2937",
              display: "flex",
              gap: "10px"
            }}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSend()}
                placeholder="Ask Luna anything about the market..."
                style={{
                  flex: 1,
                  background: "#1e2937",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: "14.5px",
                  outline: "none"
                }}
              />
              <button 
                onClick={handleSend}
                style={{
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  padding: "0 22px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Tips Balance */}
            <div style={{ 
              background: "#0f172a", 
              border: "1px solid #1e2937", 
              borderRadius: "16px", 
              padding: "20px" 
            }}>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>
                Your Tips Balance
              </div>
              <div style={{ fontSize: "34px", fontWeight: "700", marginBottom: "14px" }}>
                {tips}
              </div>
              <button 
                onClick={handleShareAlpha}
                style={{
                  width: "100%",
                  background: "#22c55e",
                  color: "#000",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14.5px",
                  cursor: "pointer"
                }}
              >
                Share Alpha → Earn More Tips
              </button>
            </div>

            {/* Leaderboard */}
            <div style={{ 
              background: "#0f172a", 
              border: "1px solid #1e2937", 
              borderRadius: "16px", 
              padding: "18px 20px" 
            }}>
              <div style={{ fontWeight: "600", marginBottom: "14px", fontSize: "14.5px" }}>
                Top Tip Earners
              </div>
              {[
                { user: "afifarioss", tips: 1240 },
                { user: "basebuilder", tips: 890 },
                { user: "onchaindad", tips: 650 }
              ].map((row, i) => (
                <div key={i} style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < 2 ? "1px solid #1e2937" : "none",
                  fontSize: "14.5px"
                }}>
                  <span>{row.user}</span>
                  <span style={{ color: "#22c55e", fontWeight: "600" }}>{row.tips}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}