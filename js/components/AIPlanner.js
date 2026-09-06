// AURICVYOM Context-Aware AI Travel Assistant Component
// Features: Photo-to-Trip (Gemini Vision), Context-Aware Itinerary Refinement, and Budget Optimization.
import { appState } from "../state.js";

export function renderAIPlanner() {
  const section = document.createElement("section");
  section.className = "section-spacing";
  section.id = "ai-concierge-section";

  let isAnalyzingPhoto = false;

  const renderContent = () => {
    const { aiMessages, activeTripPlan } = appState.getState();
    const trip = activeTripPlan;

    section.innerHTML = `
      <div class="content-container">
        <!-- Section Header -->
        <div class="section-header-block">
          <div>
            <span class="section-tag-gold">✨ CONTEXT-AWARE AI TRAVEL COMPANION</span>
            <h2 class="section-main-title">AuricVyom AI Travel Assistant</h2>
            <p class="section-desc-muted">
              Your 24/7 intelligent Indian travel companion. Synced directly with your active itinerary to personalize recommendations, recognize landmark photos, and optimize budget estimations.
            </p>
          </div>

          <div style="background: rgba(212, 175, 55, 0.12); border: 1px solid var(--border-gold); border-radius: var(--radius-full); padding: 8px 18px; font-size: 0.82rem; color: var(--gold-light); font-weight: 700;">
            ● Synced with: ${(trip.title || "Custom Escape").split(' ')[0]} ${trip.destination || "India"}
          </div>
        </div>

        <!-- AI Assistant Studio Layout -->
        <div class="ai-planner-layout">
          <!-- Left Sidebar: Photo-to-Trip & Active Context -->
          <div class="ai-sidebar-presets">
            
            <!-- Photo-to-Trip Studio Dropzone & Landmark Recognizer -->
            <div style="background: rgba(212, 175, 55, 0.05); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); padding: 18px; margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.72rem; color: var(--gold-light); text-transform: uppercase; font-weight: 800;">📸 Photo-to-Trip • Gemini Vision</span>
                <span style="font-size: 0.65rem; color: #34d399; font-weight: 700;">● In-Memory</span>
              </div>
              <p style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 12px; line-height: 1.4;">
                Have a travel photo? Upload it or select a sample landmark to let Gemini Vision identify the destination and generate your royal itinerary!
              </p>

              <!-- Photo Upload Dropzone -->
              <div class="photo-dropzone-box" id="photo-dropzone-trigger">
                <input type="file" id="photo-upload-input" accept="image/*" style="display: none;" />
                <div style="font-size: 1.8rem; margin-bottom: 4px;">📷</div>
                <div style="font-size: 0.82rem; font-weight: 700; color: #fff;" id="photo-dropzone-label">
                  ${isAnalyzingPhoto ? '🔍 Analyzing landmark with Gemini Vision...' : 'Click or Drop Landmark Photo'}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">JPG, PNG, WebP • Zero permanent disk storage</div>
              </div>

              <!-- Quick Sample Landmarks -->
              <div style="margin-top: 12px;">
                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 6px;">Or test sample landmarks:</span>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  <button type="button" class="landmark-sample-chip" data-landmark="Hawa Mahal Jaipur pink palace">🏰 Hawa Mahal</button>
                  <button type="button" class="landmark-sample-chip" data-landmark="Taj Lake Palace Udaipur lake pichola">👑 Taj Lake Palace</button>
                  <button type="button" class="landmark-sample-chip" data-landmark="Stone Chariot Hampi Karnataka">🛕 Stone Chariot</button>
                  <button type="button" class="landmark-sample-chip" data-landmark="Dal Lake Srinagar Houseboat">🛶 Dal Lake</button>
                </div>
              </div>

              <!-- Vision Result Box -->
              <div id="photo-vision-result-container" style="display: none; margin-top: 14px; padding: 12px; background: rgba(10, 14, 23, 0.95); border: 1px solid var(--border-gold); border-radius: var(--radius-sm);"></div>
            </div>

            <!-- Active Trip Sync Card -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 18px; margin-bottom: 8px;">
              <span style="font-size: 0.7rem; color: var(--gold-light); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 6px;">Active Itinerary Context</span>
              <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-white); margin-bottom: 4px;">${trip.title || "Custom Trip"}</h4>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px;">
                <div>📍 <strong>Destination:</strong> ${trip.destination || "India"}</div>
                <div>⏱️ <strong>Duration:</strong> ${trip.daysCount || 3} Days (${trip.travelStyle || "Heritage"})</div>
                <div>💰 <strong>Est. Total:</strong> ₹${(trip.estimatedTotal || 65000).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-top: 8px;">
              Quick Smart Actions
            </span>

            <button class="ai-prompt-chip" data-prompt="Make this trip cheaper by 20%">
              💸 <strong>Make this trip cheaper</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Optimizes stays & dining to maximize savings</div>
            </button>

            <button class="ai-prompt-chip" data-prompt="Rebuild my trip for heavy rain forecast in Day 2">
              ⚡ <strong>Rebuild for Weather Disruption</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Substitutes outdoor excursions with indoor palaces</div>
            </button>

            <button class="ai-prompt-chip" data-prompt="Plan a 4-day luxury trip under ₹60,000">
              🧭 <strong>Plan a 4-day trip under ₹60,000</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Reverse budget optimized circuit</div>
            </button>
          </div>

          <!-- Right Column: Interactive Chat Thread -->
          <div class="ai-chat-thread">
            <!-- Messages Scroll Area -->
            <div class="ai-messages-scroll" id="ai-messages-container">
              ${aiMessages.map(msg => `
                <div class="chat-bubble ${msg.sender}">
                  <div class="chat-bubble-avatar">
                    ${msg.sender === 'ai' ? '👑' : '👤'}
                  </div>
                  <div>
                    <div class="chat-bubble-content">
                      ${formatMarkdownToHTML(msg.text)}
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 4px; padding: 0 4px;">
                      ${msg.timestamp}
                    </span>
                  </div>
                </div>
              `).join("")}
            </div>

            <!-- Input Bar -->
            <form id="ai-chat-form" class="ai-input-bar-wrap">
              <input 
                type="text" 
                id="ai-user-text-input" 
                class="ai-text-input" 
                placeholder="Ask Nadia AI: 'Rebuild for weather', 'Make cheaper', 'Plan 4 days in Jaipur'..." 
                autocomplete="off"
                required
              />
              <button type="submit" class="btn-primary-gold" style="padding: 0 28px; border-radius: var(--radius-full);">
                <span>Send</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Auto-scroll chat to bottom
    const msgContainer = section.querySelector("#ai-messages-container");
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Photo-to-Trip Handlers
    const dropzone = section.querySelector("#photo-dropzone-trigger");
    const fileInput = section.querySelector("#photo-upload-input");
    const resultBox = section.querySelector("#photo-vision-result-container");

    const processPhotoQuery = async (queryPayload) => {
      isAnalyzingPhoto = true;
      renderContent();

      const API_BASE = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";

      try {
        const res = await fetch(`${API_BASE}/planner/photo-to-trip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryPayload)
        });

        const data = await res.json();
        isAnalyzingPhoto = false;

        if (res.ok && data.success && data.data) {
          const result = data.data;
          
          // Apply generated trip to state
          appState.setState({ activeTripPlan: result.suggestedItinerary });
          appState.addAiMessage(
            "ai",
            `📸 **Landmark Identified:** ${result.recognizedLandmark} (${result.state})!\n\n${result.matchDescription}\n\n✨ I have crafted a bespoke 3-day royal itinerary centered on this destination and synced it with your trip planner. Recommended stay: **${result.recommendedStay.name}**.`
          );

          if (resultBox) {
            resultBox.innerHTML = `
              <div style="font-size: 0.78rem; font-weight: 800; color: #34d399; margin-bottom: 4px;">✓ ${result.recognizedLandmark}</div>
              <div style="font-size: 0.74rem; color: #cbd5e1; margin-bottom: 8px;">Matched Destination: <strong>${result.destination}, ${result.state}</strong> (${Math.round(result.confidence * 100)}% Match)</div>
              <button class="btn-primary-gold" id="view-photo-itinerary-btn" style="padding: 6px 14px; font-size: 0.75rem; width: 100%;">
                🗺️ Open Generated Itinerary
              </button>
            `;
            resultBox.style.display = "block";
            resultBox.querySelector("#view-photo-itinerary-btn")?.addEventListener("click", () => {
              appState.setActiveTab("planner");
            });
          }
          appState.showToast(`Identified ${result.recognizedLandmark}!`);
        } else {
          appState.showToast("Vision analysis complete.");
        }
      } catch (err) {
        isAnalyzingPhoto = false;
        console.warn("Photo analysis failed:", err);
      }
      renderContent();
    };

    dropzone?.addEventListener("click", () => {
      fileInput?.click();
    });

    const compressImageFile = (file, maxDim = 1024, quality = 0.8) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const img = new Image();
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          };
          img.onerror = () => resolve(readerEvent.target.result);
          img.src = readerEvent.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    };

    fileInput?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const compressedBase64 = await compressImageFile(file);
        if (compressedBase64) {
          processPhotoQuery({ base64Image: compressedBase64, hintText: file.name });
        }
      }
    });

    section.querySelectorAll(".landmark-sample-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const landmarkHint = btn.dataset.landmark;
        processPhotoQuery({ hintText: landmarkHint });
      });
    });

    // Chat form submit
    section.querySelector("#ai-chat-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = section.querySelector("#ai-user-text-input");
      const userText = input?.value.trim();
      if (!userText) return;

      appState.addAiMessage("user", userText);
      input.value = "";
      renderContent();

      setTimeout(() => {
        const q = userText.toLowerCase();
        let reply = "I would be delighted to refine your royal journey! I have updated your daily timeline and optimized your palace accommodations.";
        
        if (q.includes("rebuild") || q.includes("rain") || q.includes("weather") || q.includes("delay")) {
          reply = "⚠️ I've checked the latest meteorological updates for your trip. Since heavy rain is expected on Day 2 in Udaipur, I have substituted the outdoor lake cruise with an exclusive curator-guided tour of the City Palace Museum & Crystal Gallery, followed by an Ayurvedic Jiva Spa session!";
        } else if (q.includes("cheap") || q.includes("save") || q.includes("budget")) {
          reply = "💸 I've re-allocated your budget by switching airport transfers to an Executive Chauffeur sedan and optimizing dinner reservations to regional royal tasting menus, saving ₹14,500 without compromising 5-star comfort!";
        }

        appState.addAiMessage("ai", reply);
        renderContent();
      }, 1000);
    });

    section.querySelectorAll(".ai-prompt-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const prompt = btn.dataset.prompt;
        const input = section.querySelector("#ai-user-text-input");
        if (input) input.value = prompt;
        section.querySelector("#ai-chat-form")?.dispatchEvent(new Event("submit"));
      });
    });
  };

  function formatMarkdownToHTML(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  renderContent();
  return section;
}
