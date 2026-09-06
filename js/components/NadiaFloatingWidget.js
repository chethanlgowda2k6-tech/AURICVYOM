// AURICVYOM — NADIA Elite AI Luxury Concierge Floating Widget
// Elegant, Friendly, Sophisticated & Conversational AI Travel Companion
import { appState } from "../state.js";
import { STAYS } from "../data/stays.js";

export function renderNadiaFloatingWidget() {
  const container = document.createElement("div");
  container.className = "nadia-floating-dock";
  container.id = "nadia-floating-container";

  let isChatOpen = false;
  let isTyping = false;
  let chatHistory = [
    {
      sender: "nadia",
      text: "Namaste! ✨ I'm <strong>Nadia</strong>, your personal luxury concierge here at AuricVyom. I'm so excited to help you plan your next getaway! Whether you're dreaming of a royal palace escape, a tranquil coastal villa, or have questions about our 10-minute room lock & cancellation policies, I'm right here for you. How can I brighten your day? 😊",
      options: [
        { label: "🏰 Royal Palaces in Rajasthan", query: "Show me royal palaces in Rajasthan" },
        { label: "🌴 Coastal Villas in Goa", query: "Best private villas in Goa" },
        { label: "☕ Misty Coffee Retreats in Coorg", query: "Tell me about luxury stays in Coorg" },
        { label: "🛡️ 10-Minute Hold & Refunds", query: "How does the 10 minute room lock and cancellation refund work?" }
      ]
    }
  ];

  // Sophisticated, friendly & girl-like conversational tone engine
  const getFriendlyLocalReply = (query) => {
    const q = query.toLowerCase().trim();

    // Friendly greetings
    if (q === "hi" || q === "hello" || q === "hey" || q === "namaste" || q.startsWith("hi ") || q.startsWith("hello ") || q.startsWith("hey ")) {
      return {
        text: "Hey there! It is so lovely to meet you! ✨ How are you doing today? Are you planning a dream holiday, or just exploring some inspiring destinations? Tell me your vibe — regal palaces, serene backwaters, or misty mountains? I would love to help you find the perfect stay! 💕",
        options: [
          { label: "👑 Royal Palaces (Jaipur/Udaipur)", query: "Recommend a royal palace stay" },
          { label: "🏖️ Beach & Sunsets (Goa)", query: "Best beach resorts in Goa" },
          { label: "🏔️ Mountains & Serenity (Coorg/Shimla)", query: "Hill stations and mountain retreats" }
        ]
      };
    }

    // Friendly "how are you"
    if (q.includes("how are you") || q.includes("how r u") || q.includes("how are u") || q.includes("how's it going") || q.includes("how is your day")) {
      return {
        text: "I am having such a wonderful day, thank you so much for asking! 🥰 Helping lovely travelers like you explore India's most magical sanctuaries always brings me so much joy. How has your week been? Are you looking for a quick weekend escape or a longer holiday?",
        options: [
          { label: "✨ Quick Weekend Escape", query: "Quick weekend luxury getaway" },
          { label: "✈️ Grand Multi-Day Tour", query: "Plan a 5-day royal luxury tour" }
        ]
      };
    }

    // Friendly "who are you"
    if (q.includes("who are you") || q.includes("what is your name") || q.includes("tell me about yourself") || q.includes("what can you do")) {
      return {
        text: "I'm **Nadia**! Think of me as your personal travel bestie and luxury concierge at AuricVyom. 👑 I know all the secret royal palaces, private pool villas, and hidden hill sanctuaries across India. I can also help you lock rooms with our 10-minute hold or share exclusive promo codes like **AURIC10**! What are you curious about today?",
        options: [
          { label: "🎁 Active Promo Codes", query: "What promo codes are active?" },
          { label: "🏰 Explore Royal Palaces", query: "Show me royal palaces in Rajasthan" }
        ]
      };
    }

    // Friendly appreciation / Thank you
    if (q.includes("thank") || q.includes("thx") || q.includes("awesome") || q.includes("great") || q.includes("perfect") || q.includes("cute") || q.includes("sweet") || q.includes("nice")) {
      return {
        text: "Aww, you are so very sweet! 🥰 It truly makes my day to assist you. Is there anything else you'd like to explore, or shall we lock in a 10-minute hold on your favorite suite?",
        options: [
          { label: "🗺️ Open AI Trip Planner", query: "Plan an itinerary" },
          { label: "🏨 Explore Top Stays", query: "Show me top luxury stays" }
        ]
      };
    }

    // Jaipur / Rajasthan
    if (q.includes("jaipur") || q.includes("rajasthan") || q.includes("rambagh") || q.includes("palace")) {
      const stay = STAYS.find(s => s.name.includes("Rambagh")) || STAYS[0];
      return {
        text: `Oh, Jaipur has my whole heart! 🏰 If you want a stay fit for royalty, you simply must experience **${stay.name}**. Picture sipping morning tea across 47 acres of tranquil royal gardens while peacocks wander past, followed by authentic Rajput dining under crystal chandeliers. It's pure magic! Would you like me to hold a room for you?`,
        stay,
        options: [
          { label: "⚡ Lock Room (10-Min Hold)", query: "How to book Rambagh Palace?" },
          { label: "✨ 3-Day Jaipur Itinerary", query: "Plan 3 days in Jaipur" }
        ]
      };
    }

    // Udaipur
    if (q.includes("udaipur") || q.includes("lake palace") || q.includes("pichola")) {
      const stay = STAYS.find(s => s.name.includes("Lake Palace") || s.name.includes("Rambagh")) || STAYS[0];
      return {
        text: `Udaipur is straight out of a fairy tale! ✨ Imagine arriving by private boat at twilight as the white marble palace lights up across Lake Pichola. It is hands down one of the most romantic settings in the world. Shall I check live availability for your dates?`,
        stay,
        options: [
          { label: "⚡ Check Availability", query: "Check live room availability for Taj Lake Palace" },
          { label: "🌅 Romantic Sunset Itinerary", query: "Plan romantic Udaipur getaway" }
        ]
      };
    }

    // Goa
    if (q.includes("goa") || q.includes("beach") || q.includes("coastal") || q.includes("villa")) {
      const stay = STAYS.find(s => s.name.includes("Goa") || s.destinationName.includes("Goa")) || STAYS[1];
      return {
        text: `Oh, Goa is absolute bliss! 🌴 If you're looking for that effortless coastal luxury, **${stay.name}** in South Goa is divine. Private plunge pool villas, lush Mediterranean greenery, and private beach walks at golden hour. It's the ultimate relaxing escape!`,
        stay,
        options: [
          { label: "⚡ Reserve Goa Villa", query: "How to book Goa Villa?" },
          { label: "🌅 Coastal Sunset Plan", query: "Plan romantic Goa getaway" }
        ]
      };
    }

    // Coorg
    if (q.includes("coorg") || q.includes("karnataka") || q.includes("coffee") || q.includes("tamara") || q.includes("nature")) {
      const stay = STAYS.find(s => s.name.includes("Coorg") || s.destinationName.includes("Coorg")) || STAYS[2];
      return {
        text: `Coorg is just heavenly! ☕ **${stay.name}** has these breathtaking wooden treehouse villas nestled 3,500 feet high in a lush coffee and cardamom plantation with private waterfalls. The misty morning air and birdsong are so rejuvenating!`,
        stay,
        options: [
          { label: "⚡ Reserve Treehouse Villa", query: "Book Tamara Coorg" },
          { label: "🌿 Coffee Trail Itinerary", query: "Plan Coorg coffee tour" }
        ]
      };
    }

    // Policies & 10-Minute Hold
    if (q.includes("hold") || q.includes("lock") || q.includes("cancellation") || q.includes("refund")) {
      return {
        text: `You're in great hands! Here's how we protect your plans with zero stress:<br/><br/>• **10-Minute Room Lock**: The moment you start checkout, we exclusively freeze the room for 10 minutes so no other traveler can take it.<br/>• **Sanctuary Cancellation Policy**: You receive a full 100% refund up to 7 days before your stay, and 50% refund up to 24 hours prior. We make sure you never have to worry! 🛡️`,
        options: [
          { label: "🎁 Active Promo Codes", query: "What promo codes are active?" },
          { label: "🏰 View Verified Palaces", query: "Show me royal palaces in Rajasthan" }
        ]
      };
    }

    // Promo Codes
    if (q.includes("promo") || q.includes("coupon") || q.includes("discount") || q.includes("offer") || q.includes("code")) {
      return {
        text: `Yay, you're going to love this! 🎉 You can use my favorite promo code **AURIC10** at checkout to enjoy a sweet **10% bespoke discount** across all our luxury palaces, private villas, and hillside sanctuaries!`,
        options: [
          { label: "🏰 Explore Stays to Book", query: "Show me royal palaces in Rajasthan" }
        ]
      };
    }

    // Fallback response in Nadia's warm voice
    return {
      text: `I would be thrilled to help you with that! ✨ I can curate private heritage palaces, boutique pool villas, or build a personalized itinerary across India for **"${query}"**. Where should we start?`,
      options: [
        { label: "🏰 Explore Palaces", query: "Show me royal palaces in Rajasthan" },
        { label: "🌴 Coastal Escapes", query: "Best private villas in Goa" },
        { label: "✨ Open AI Studio", query: "Plan a luxury trip to India" }
      ]
    };
  };

  // Asynchronous Assistant caller that queries backend /api/v1/assistant/ask
  const fetchAssistantReply = async (userText) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (appState.state.token) {
        headers['Authorization'] = `Bearer ${appState.state.token}`;
      }

      const API_BASE = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${API_BASE}/assistant/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: userText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.answer) {
          const answerText = data.data.answer;
          let matchingStay = null;
          if (answerText.toLowerCase().includes('rambagh')) matchingStay = STAYS.find(s => s.name.includes('Rambagh'));
          else if (answerText.toLowerCase().includes('exotica') || answerText.toLowerCase().includes('goa')) matchingStay = STAYS.find(s => s.name.includes('Goa'));
          else if (answerText.toLowerCase().includes('tamara') || answerText.toLowerCase().includes('coorg')) matchingStay = STAYS.find(s => s.name.includes('Coorg'));

          return {
            text: answerText.replace(/\n/g, '<br/>'),
            stay: matchingStay,
            sources: data.data.sources,
            options: [
              { label: "🏰 Explore Royal Stays", query: "Show me royal palaces in Rajasthan" },
              { label: "🎁 Check Promo Code", query: "What promo codes are active?" },
              { label: "🗺️ Plan Itinerary", query: "Plan a customized itinerary" }
            ]
          };
        }
      }
    } catch (e) {
      console.warn("Backend assistant call failed, using local friendly engine:", e);
    }

    return getFriendlyLocalReply(userText);
  };

  const renderWidget = () => {
    container.innerHTML = `
      <!-- Expandable Nadia Luxury Chat Window (Responsive Full-Screen / Bottom Sheet on Mobile) -->
      <div id="nadia-floating-modal" class="nadia-modal-window" style="display: ${isChatOpen ? 'flex' : 'none'};">
        
        <!-- Nadia Header -->
        <div class="nadia-modal-header" style="padding: 14px 18px; background: rgba(212, 175, 55, 0.1); border-bottom: 1px solid var(--border-gold); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="position: relative; width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1.5px solid var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              👑
              <span style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 1.5px solid #080c14; box-shadow: 0 0 6px #10b981;"></span>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-family: var(--font-serif); font-weight: 800; color: #fff; font-size: 1.1rem; letter-spacing: 0.5px;">NADIA</span>
                <span style="font-size: 0.62rem; padding: 2px 7px; background: rgba(212,175,55,0.2); border: 1px solid var(--gold-primary); border-radius: 10px; color: var(--gold-light); font-weight: 800; letter-spacing: 0.5px;">AI CONCIERGE</span>
              </div>
              <span style="font-size: 0.72rem; color: #34d399; font-weight: 600;">● Online • Powered by Gemini & Auric AI</span>
            </div>
          </div>

          <button id="nadia-floating-close-btn" style="color: var(--text-secondary); font-size: 1.3rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 50%; background: rgba(255,255,255,0.06); transition: color 0.2s;" title="Close Nadia" aria-label="Close Chat">✕</button>
        </div>

        <!-- Chat Conversation Body -->
        <div id="nadia-floating-msgs" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch;">
          ${chatHistory.map(msg => `
            <div style="display: flex; flex-direction: column; align-items: ${msg.sender === 'user' ? 'flex-end' : 'flex-start'}; gap: 6px;">
              <div style="max-width: 88%; padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.88rem; line-height: 1.55; ${msg.sender === 'user' ? 'background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark)); color: #07090e; font-weight: 600; border-bottom-right-radius: 4px;' : 'background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: #f1f5f9; border-bottom-left-radius: 4px;'}">
                ${msg.text}
              </div>

              ${msg.stay ? `
                <div style="width: 92%; max-width: 340px; background: rgba(212,175,55,0.09); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; margin-top: 4px;">
                  <img src="${msg.stay.image}" alt="${msg.stay.name}" style="width: 65px; height: 55px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-gold);" />
                  <div style="flex: 1; overflow: hidden;">
                    <div style="font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${msg.stay.name}</div>
                    <div style="font-size: 0.74rem; color: var(--gold-light); font-weight: 700; margin: 2px 0;">${appState.formatPrice(msg.stay.pricePerNight)}/night</div>
                    <button class="nadia-stay-reserve-btn" data-stay-id="${msg.stay.id}" style="min-height: 36px; padding: 4px 12px; font-size: 0.75rem; background: var(--gold-primary); color: #07090e; font-weight: 800; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                      ⚡ Lock 10-Min Hold
                    </button>
                  </div>
                </div>
              ` : ''}

              ${msg.sources && msg.sources.length > 0 ? `
                <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px;">
                  ${msg.sources.map(s => `
                    <span style="font-size: 0.65rem; padding: 1px 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-muted);">
                      📌 ${s.title}
                    </span>
                  `).join('')}
                </div>
              ` : ''}

              ${msg.options ? `
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                  ${msg.options.map(opt => `
                    <button class="nadia-quick-opt-btn" data-query="${opt.query}" style="min-height: 38px; padding: 6px 14px; font-size: 0.78rem; border-radius: 14px; background: rgba(212,175,55,0.12); border: 1px solid var(--border-gold); color: var(--gold-light); cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center;">
                      ${opt.label}
                    </button>
                  `).join("")}
                </div>
              ` : ''}
            </div>
          `).join("")}

          <!-- Realistic Human-like Typing Indicator Bubble -->
          ${isTyping ? `
            <div class="nadia-typing-bubble">
              <span style="font-size: 0.88rem;">👑</span>
              <span style="font-size: 0.82rem; color: var(--gold-light); font-weight: 600;">Nadia is typing</span>
              <div class="nadia-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Chat Input Row -->
        <div class="nadia-input-row" style="padding: 12px 16px; background: rgba(10,14,23,0.98); border-top: 1px solid var(--border-subtle); display: flex; gap: 8px; align-items: center;">
          <input 
            type="text" 
            id="nadia-floating-input" 
            placeholder="Ask Nadia anything (e.g. recommend palace, hold policy)..." 
            style="flex: 1; background: rgba(255,255,255,0.07); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 12px 16px; font-size: 16px; color: #fff; outline: none; transition: border-color 0.2s;" 
          />
          <button id="nadia-floating-send-btn" style="min-height: 44px; padding: 10px 20px; background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark)); color: #07090e; font-weight: 800; font-size: 0.88rem; border-radius: var(--radius-full); cursor: pointer; box-shadow: 0 4px 15px rgba(212,175,55,0.3); transition: transform 0.15s; flex-shrink: 0;">
            Send
          </button>
        </div>
      </div>

      <!-- Docked Trigger Button -->
      <button class="nadia-floating-btn" id="nadia-dock-toggle-btn" title="Chat with Nadia — AI Concierge">
        <div class="nadia-avatar-wrap" style="width: 42px; height: 42px;">
          <div class="nadia-avatar-glow"></div>
          <span style="font-size: 1.3rem;">👑</span>
          <span class="nadia-online-indicator" style="width: 11px; height: 11px;"></span>
        </div>
        <div class="nadia-floating-badge">
          <span class="title">Ask NADIA</span>
          <span class="status">● AI Concierge</span>
        </div>
      </button>
    `;

    // Listeners
    container.querySelector("#nadia-dock-toggle-btn")?.addEventListener("click", () => {
      isChatOpen = !isChatOpen;
      renderWidget();
      if (isChatOpen) {
        setTimeout(() => {
          const inp = container.querySelector("#nadia-floating-input");
          if (inp) inp.focus();
        }, 100);
      }
    });

    container.querySelector("#nadia-floating-close-btn")?.addEventListener("click", () => {
      isChatOpen = false;
      renderWidget();
    });

    const sendMsg = async (queryText) => {
      const inp = container.querySelector("#nadia-floating-input");
      const textToSend = queryText || (inp ? inp.value.trim() : "");
      if (!textToSend) return;

      if (inp) inp.value = "";

      // 1. Instantly display user's message
      chatHistory.push({ sender: "user", text: textToSend });
      
      // 2. Trigger realistic human typing state
      isTyping = true;
      renderWidget();

      // Ensure smooth scroll to bottom while typing
      const msgsDiv1 = container.querySelector("#nadia-floating-msgs");
      if (msgsDiv1) msgsDiv1.scrollTop = msgsDiv1.scrollHeight;

      // 3. Natural 2-second realistic delay (2000ms)
      const [reply] = await Promise.all([
        fetchAssistantReply(textToSend),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      // 4. Render Nadia's thoughtful reply
      isTyping = false;
      chatHistory.push({ sender: "nadia", ...reply });
      renderWidget();

      // Scroll to bottom & refocus input
      const msgsDiv2 = container.querySelector("#nadia-floating-msgs");
      if (msgsDiv2) msgsDiv2.scrollTop = msgsDiv2.scrollHeight;

      setTimeout(() => {
        const inpRefocus = container.querySelector("#nadia-floating-input");
        if (inpRefocus) inpRefocus.focus();
      }, 50);
    };

    container.querySelector("#nadia-floating-send-btn")?.addEventListener("click", () => sendMsg());
    container.querySelector("#nadia-floating-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMsg();
      }
    });

    container.querySelectorAll(".nadia-quick-opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const q = btn.dataset.query;
        sendMsg(q);
      });
    });

    container.querySelectorAll(".nadia-stay-reserve-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const stayId = btn.dataset.stayId;
        const stay = STAYS.find(s => s.id === stayId);
        if (stay) {
          isChatOpen = false;
          renderWidget();
          appState.openBooking(stay, "stay");
        }
      });
    });
  };

  renderWidget();
  return container;
}
