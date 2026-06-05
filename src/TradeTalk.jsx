import React, { useState, useEffect, useCallback } from 'react';

// Mock data for fallback
const MOCK_PRICES = {
  ETH: { price: 2456.78, change: 2.34 },
  BTC: { price: 67234.56, change: -1.23 },
  BASE: { price: 0.00001234, change: 5.67 }
};

export default function TradeTalk() {
  const [prices, setPrices] = useState(MOCK_PRICES);
  const [messages, setMessages] = useState([
    { id: 1, user: "Luna", text: "Welcome to TradeTalk on Base! How can I help you today?", time: "just now" }
  ]);
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [tips, setTips] = useState(1240);
  const [leaderboard, setLeaderboard] = useState([
    { user: "afifarioss", tips: 1240 },
    { user: "basebuilder", tips: 890 },
    { user: "onchaindad", tips: 650 }
  ]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        ETH: { ...prev.ETH, price: prev.ETH.price + (Math.random() - 0.5) * 5 },
        BTC: { ...prev.BTC, price: prev.BTC.price + (Math.random() - 0.5) * 50 },
        BASE: { ...prev.BASE, price: prev.BASE.price + (Math.random() - 0.5) * 0.000001 }
      }));
    }, 8000);
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
    
    // Simple AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        user: "Luna",
        text: "Thanks for your message! I'm analyzing the market for you...",
        time: "now"
      }]);
    }, 800);
    
    setInput("");
  };

  const handleShareAlpha = () => {
    const text = "Just found alpha on Base using TradeTalk! Check it out: https://github.com/afifarioss/Tradetalk-";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    
    // Reward user with tips
    setTips(prev => prev + 50);
    alert("Thanks for sharing! +50 tips added to your balance.");
  };

  const handleWalletConnect = () => {
    setShowWalletModal(true);
    setTimeout(() => {
      setWalletConnected(true);
      setShowWalletModal(false);
      alert("Wallet connected successfully! (Demo mode)");
    }, 1200);
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#050710", 
      color: "#fff",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid #1a2332",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>TradeTalk</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Social Trading on Base</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button 
            onClick={handleShareAlpha}
            style={{
              background: "#22c55e",
              color: "#000",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Share Alpha → Earn Tips
          </button>
          
          <button 
            onClick={handleWalletConnect}
            style={{
              background: walletConnected ? "#166534" : "#1e2937",
              color: "#fff",
              border: "1px solid #334155",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {walletConnected ? "✓ Connected" : "Connect Wallet"}
          </button>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Price Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {Object.entries(prices).map(([symbol, data]) => (
            <div key={symbol} style={{ 
              background: "#0f172a", 
              borderRadius: "12px", 
              padding: "16px",
              border: "1px solid #1e2937"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>{symbol}</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", marginTop: "4px" }}>
                    ${data.price.toFixed(symbol === "BASE" ? 8 : 2)}
                  </div>
                </div>
                <div style={{ 
                  color: data.change >= 0 ? "#22c55e" : "#ef4444",
                  fontWeight: "600"
                }}>
                  {data.change >= 0 ? "+" : ""}{data.change}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
          
          {/* Chat Section */}
          <div style={{ background: "#0f172a", borderRadius: "16px", border: "1px solid #1e2937", overflow: "hidden" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #1e2937", fontWeight: "600" }}>
              Live Trading Chat (Luna AI)
            </div>
            
            <div style={{ height: "380px", overflowY: "auto", padding: "16px" }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <strong style={{ color: msg.user === "Luna" ? "#60a5fa" : "#22c55e" }}>{msg.user}</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{msg.time}</span>
                  </div>
                  <div style={{ marginTop: "4px", color: "#e2e8f0" }}>{msg.text}</div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: "12px", borderTop: "1px solid #1e2937", display: "flex", gap: "8px" }}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSend()}
                placeholder="Ask Luna anything..."
                style={{
                  flex: 1,
                  background: "#1e2937",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#fff",
                  outline: "none"
                }}
              />
              <button 
                onClick={handleSend}
                style={{
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  padding: "0 20px",
                  borderRadius: "8px",
                  fontWeight: "600"
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Tips Balance */}
            <div style={{ background: "#0f172a", borderRadius: "16px", padding: "20px", border: "1px solid #1e2937" }}>
              <div style={{ fontSize: "14px", color: "#64748b" }}>Your Tips Balance</div>
              <div style={{ fontSize: "32px", fontWeight: "700", margin: "8px 0" }}>{tips}</div>
              <button 
                onClick={handleShareAlpha}
                style={{
                  width: "100%",
                  background: "#22c55e",
                  color: "#000",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Share Alpha → Earn More Tips
              </button>
            </div>

            {/* Leaderboard */}
            <div style={{ background: "#0f172a", borderRadius: "16px", padding: "20px", border: "1px solid #1e2937" }}>
              <div style={{ fontWeight: "600", marginBottom: "12px" }}>Top Tip Earners</div>
              {leaderboard.map((user, i) => (
                <div key={i} style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < leaderboard.length - 1 ? "1px solid #1e2937" : "none"
                }}>
                  <span>{user.user}</span>
                  <span style={{ color: "#22c55e", fontWeight: "600" }}>{user.tips}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}