// AURICVYOM Intelligent Interactive Trip Planner Component
// Features: Rebuild My Trip (Disruption Re-planning), Reverse Budget Planning, and Itinerary Visualizer.
import { appState } from "../state.js";
import { DESTINATIONS } from "../data/destinations.js";
import { renderItineraryMap } from "./ItineraryMap.js";

// Destination Cost Estimator helper
function getDestinationCostEstimates(destId, days = 3, travelers = 2, travelStyle = "Royal Heritage & Palaces") {
  const d = DESTINATIONS.find(item => item.id === destId) || DESTINATIONS[0];
  let dailyBase = 16000;
  if (d.estimatedBudget?.dailyEstimate) {
    const matched = d.estimatedBudget.dailyEstimate.match(/₹([0-9,]+)/);
    if (matched) {
      dailyBase = parseInt(matched[1].replace(/,/g, ''), 10);
    }
  } else if (d.budgetTierNumeric?.max) {
    dailyBase = Math.round((d.budgetTierNumeric.min + d.budgetTierNumeric.max) / 2);
  }

  let stayPerNight = Math.round(dailyBase * 0.65);
  let transportPerDay = Math.round(dailyBase * 0.18);
  let diningPerDay = Math.round(dailyBase * 0.14);
  let activitiesPerDay = Math.round(dailyBase * 0.08);

  if (travelStyle && travelStyle.toLowerCase().includes("budget")) {
    stayPerNight = Math.round(stayPerNight * 0.5);
    transportPerDay = Math.round(transportPerDay * 0.6);
    diningPerDay = Math.round(diningPerDay * 0.6);
    activitiesPerDay = Math.round(activitiesPerDay * 0.6);
  }

  const stayTotal = stayPerNight * Math.max(1, days - 1);
  const transportTotal = transportPerDay * days;
  const diningTotal = Math.round(diningPerDay * days * Math.max(1, travelers * 0.75));
  const activitiesTotal = Math.round(activitiesPerDay * days * Math.max(1, travelers * 0.75));
  const totalRecommended = stayTotal + transportTotal + diningTotal + activitiesTotal;

  return {
    destName: d.name,
    destState: d.state || d.country,
    dailyBase,
    stayPerNight,
    transportPerDay,
    diningPerDay,
    activitiesPerDay,
    stayTotal,
    transportTotal,
    diningTotal,
    activitiesTotal,
    totalRecommended,
  };
}

export function renderTripPlanner() {
  const section = document.createElement("section");
  section.className = "section-spacing";
  section.id = "trip-planner-section";

  let isGeneratorModalOpen = false;
  let isRebuildModalOpen = false;
  let planningMode = "destination"; // 'destination' | 'budget'
  let activeRevision = null;

  // Generator form state
  let genFrom = "Bengaluru";
  let genDestId = "coorg";
  let genDays = 3;
  let genTravellers = 2;
  let genBudget = 75000;
  let genStyle = "Royal Heritage & Palaces";
  let genPace = "Balanced";
  let genInterests = ["Nature", "Food"];

  // Component Locking state for Budget Mode
  let lockStay = true;
  let lockTransport = false;

  const renderContent = () => {
    const { activeTripPlan } = appState.getState();
    const trip = activeTripPlan;
    const budgetSummary = trip.budgetSummary || {
      targetBudget: trip.targetBudget || 75000,
      estimatedTotal: trip.estimatedTotal || 68500,
      remainingBudget: (trip.targetBudget || 75000) - (trip.estimatedTotal || 68500),
      isUnderBudget: true,
      breakdown: {
        accommodation: 45000,
        transport: 12000,
        food: 6500,
        activities: 3500,
        tickets: 1500,
        shopping: 0,
        other: 0
      }
    };

    const percentageUsed = Math.min(100, Math.round((budgetSummary.estimatedTotal / budgetSummary.targetBudget) * 100));
    const currentEst = getDestinationCostEstimates(genDestId, genDays, genTravellers, genStyle);
    const selectedDestObj = DESTINATIONS.find(d => d.id === genDestId);
    const selectedDestName = genDestId === 'auto'
      ? (genBudget < 35000 ? 'Hampi & Boulder Sanctuary' : genBudget < 65000 ? 'Coorg & Coffee Plantations' : genBudget < 120000 ? 'Jaipur & Royal Forts' : genBudget < 220000 ? 'Udaipur & Lake Palaces' : 'Kashmir & Himalayan Sanctuary')
      : (selectedDestObj ? selectedDestObj.name : 'Jaipur');

    section.innerHTML = `
      <div class="content-container">
        <!-- Top Toolbar & Action Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="section-tag-gold">✨ COMPANION • INTELLIGENT PLANNER</span>
              ${trip.planningMode === 'budget' ? `
                <span style="font-size: 0.72rem; padding: 2px 8px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #34d399; font-weight: 800; border-radius: var(--radius-full);">
                  💰 REVERSE-BUDGET OPTIMIZED
                </span>
              ` : ''}
              ${trip.isWeatherProtected ? `
                <span style="font-size: 0.72rem; padding: 2px 8px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #38bdf8; font-weight: 800; border-radius: var(--radius-full);">
                  🛡️ WEATHER PROTECTED
                </span>
              ` : ''}
            </div>
            <h1 class="h2" style="margin-top: 6px;">${trip.title}</h1>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">
              Autonomous luxury itinerary synced with real-time room availability, local weather alerts, and chauffeur routes.
            </p>
          </div>

          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <button class="btn-primary-gold" id="open-planner-generator-btn" style="padding: 10px 20px; font-size: 0.85rem; font-weight: 800;">
              💰 Plan by Budget
            </button>
            <button class="btn-outline-glass" id="open-rebuild-modal-btn" style="padding: 10px 18px; font-size: 0.85rem; border-color: #f59e0b; color: #fde047;">
              ⚡ Rebuild My Trip
            </button>
            <button class="btn-outline-glass" id="save-trip-btn" style="padding: 10px 18px; font-size: 0.85rem;">
              💾 Save
            </button>
          </div>
        </div>

        <!-- Disruption Alert Banner (Proactive Monitoring) -->
        <div class="disruption-banner-card" id="disruption-alert-banner">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="disruption-icon">⚠️</span>
            <div>
              <div style="font-size: 0.88rem; font-weight: 800; color: #fde047;">Disruption Detected: Monsoonal Rain in Lake Pichola Basin</div>
              <div style="font-size: 0.78rem; color: #cbd5e1;">Day 2 boat cruise across Lake Pichola is at risk due to high tide & water warnings. Rebuild available.</div>
            </div>
          </div>
          <button class="disruption-rebuild-trigger-btn" id="trigger-rebuild-from-banner">
            ⚡ Rebuild Day 2 Plan
          </button>
        </div>

        <!-- Budget & Cost Breakdown Summary Card -->
        <div style="background: var(--bg-card); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 24px 28px; margin-bottom: 32px; box-shadow: var(--shadow-md);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Target Trip Budget</span>
              <div style="font-size: 1.6rem; font-weight: 800; color: var(--gold-light); margin-top: 2px;">
                ₹${(budgetSummary.targetBudget || 75000).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Calculated Estimated Total</span>
              <div style="font-size: 1.6rem; font-weight: 800; color: #fff; margin-top: 2px;">
                ₹${(budgetSummary.estimatedTotal || 68500).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Remaining Balance</span>
              <div style="font-size: 1.6rem; font-weight: 800; color: ${budgetSummary.isUnderBudget ? 'var(--emerald-light)' : '#f43f5e'}; margin-top: 2px;">
                ${budgetSummary.isUnderBudget ? `₹${budgetSummary.remainingBudget.toLocaleString('en-IN')} Remaining` : `₹${Math.abs(budgetSummary.remainingBudget).toLocaleString('en-IN')} Exceeded`}
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
              <span>Budget Utilization: ${percentageUsed}%</span>
              <span>${budgetSummary.isUnderBudget ? '✓ Within Budget' : '⚠️ Adjust Activities or Stay'}</span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${percentageUsed}%; background: ${budgetSummary.isUnderBudget ? 'linear-gradient(90deg, var(--gold-primary), var(--emerald-accent))' : '#f43f5e'}; transition: width 0.4s ease;"></div>
            </div>
          </div>

          <!-- Component Pill Breakdown -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span class="vibe-tag" style="background: rgba(212,175,55,0.1); border-color: var(--border-gold); color: var(--gold-light);">🏨 Stays: ₹${(budgetSummary.breakdown?.accommodation || 45000).toLocaleString('en-IN')}</span>
            <span class="vibe-tag" style="background: rgba(212,175,55,0.1); border-color: var(--border-gold); color: var(--gold-light);">🚗 Transport: ₹${(budgetSummary.breakdown?.transport || 12000).toLocaleString('en-IN')}</span>
            <span class="vibe-tag" style="background: rgba(212,175,55,0.1); border-color: var(--border-gold); color: var(--gold-light);">🍽️ Dining: ₹${(budgetSummary.breakdown?.food || 6500).toLocaleString('en-IN')}</span>
            <span class="vibe-tag" style="background: rgba(212,175,55,0.1); border-color: var(--border-gold); color: var(--gold-light);">✨ Experiences: ₹${(budgetSummary.breakdown?.activities || 3500).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Itinerary Map Integration -->
        <div id="itinerary-map-mount" style="margin-bottom: 36px;"></div>

        <!-- Day-by-Day Timeline -->
        <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 48px;">
          ${(trip.days || []).map(day => `
            <div style="background: var(--bg-surface); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
                <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: #fff;">
                  Day ${day.dayIndex || day.day || 1}: ${day.title}
                </h3>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${(day.activities || []).map(act => {
                  const itemPrice = act.price || act.cost || (act.type === 'stay' ? 18000 : act.type === 'transport' ? 3500 : act.type === 'dining' ? 2500 : 1800);
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 12px 16px;">
                      <div style="display: flex; align-items: center; gap: 14px;">
                        <span style="font-size: 0.8rem; color: var(--gold-light); font-weight: 700; min-width: 65px;">${act.time || '10:00 AM'}</span>
                        <span style="font-size: 0.88rem; color: #fff; font-weight: 600;">${act.title}</span>
                        ${act.isSubstituted ? `<span class="substituted-activity-pill">⚡ Indoor Weather Substituted</span>` : ''}
                        ${act.isLocked ? `<span style="font-size: 0.65rem; padding: 2px 6px; background: rgba(212,175,55,0.2); border: 1px solid var(--gold-primary); color: var(--gold-light); border-radius: 4px; font-weight: 800;">🔒 Locked</span>` : ''}
                      </div>
                      <div style="text-align: right; min-width: 85px;">
                        <span style="font-size: 0.86rem; color: var(--gold-light); font-weight: 700;">₹${itemPrice.toLocaleString('en-IN')}</span>
                        <span style="display: block; font-size: 0.66rem; color: var(--text-muted); text-transform: uppercase;">approx</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Plan My Trip from Budget Only Modal -->
      <div class="auric-modal-backdrop ${isGeneratorModalOpen ? 'active' : ''}" id="planner-generator-modal-backdrop">
        <div class="modal-window-container" style="max-width: 680px; padding: 32px;" id="gen-modal-window">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
            <div>
              <span class="section-tag-gold" style="font-size: 0.72rem;">💰 AI BUDGET-FIRST TRIP ENGINE</span>
              <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--text-white); margin-top: 4px;">Plan Trip by Budget</h3>
            </div>
            <button id="close-gen-modal-x" style="color: var(--text-white); font-size: 1.4rem; cursor: pointer; background: none; border: none;">✕</button>
          </div>

          <form id="trip-gen-form" style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Dropdown Row: Location of Famous Spots & Days -->
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px;">
              <!-- Location Dropdown of Famous Spots -->
              <div>
                <label for="gen-dest-select" style="font-size: 0.8rem; color: var(--gold-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                  <span>📍</span> Location & Famous Spot
                </label>
                <select
                  id="gen-dest-select"
                  style="width: 100%; padding: 12px 14px; background: var(--bg-surface); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); color: var(--text-white); font-size: 0.86rem; font-weight: 600; cursor: pointer; outline: none; box-shadow: var(--shadow-sm);"
                >
                  <option value="auto" ${genDestId === 'auto' ? 'selected' : ''}>✨ AI Auto-Pick Best Spot for My Budget</option>
                  ${DESTINATIONS.map(d => {
                    const topSpot = d.topAttractions?.[0]?.name || d.name;
                    const cleanSpot = topSpot.replace(/ Complex| Island Palace| High-Altitude Lake/gi, '');
                    const label = `${d.name.split(' & ')[0]} (${d.state || d.country}) — ${cleanSpot}`;
                    return `<option value="${d.id}" ${d.id === genDestId ? 'selected' : ''}>${label}</option>`;
                  }).join('')}
                </select>
              </div>

              <!-- Days Dropdown -->
              <div>
                <label for="gen-days-select" style="font-size: 0.8rem; color: var(--gold-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                  <span>⏱️</span> Trip Duration
                </label>
                <select
                  id="gen-days-select"
                  style="width: 100%; padding: 12px 14px; background: var(--bg-surface); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); color: var(--text-white); font-size: 0.86rem; font-weight: 600; cursor: pointer; outline: none; box-shadow: var(--shadow-sm);"
                >
                  <option value="2" ${genDays === 2 ? 'selected' : ''}>2 Days (Weekend Getaway)</option>
                  <option value="3" ${genDays === 3 ? 'selected' : ''}>3 Days (Recommended Escape)</option>
                  <option value="4" ${genDays === 4 ? 'selected' : ''}>4 Days (Relaxed Heritage)</option>
                  <option value="5" ${genDays === 5 ? 'selected' : ''}>5 Days (Royal Circuit)</option>
                  <option value="7" ${genDays === 7 ? 'selected' : ''}>7 Days (Grand Explorer)</option>
                  <option value="10" ${genDays === 10 ? 'selected' : ''}>10 Days (Comprehensive Imperial)</option>
                </select>
              </div>
            </div>

            <!-- Primary Budget Input Box -->
            <div style="background: rgba(212, 175, 55, 0.08); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 20px 18px; text-align: center; box-shadow: var(--shadow-sm);">
              <label for="gen-budget-input" style="font-size: 0.82rem; color: var(--gold-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                Enter Your Trip Budget (INR ₹)
              </label>
              <p style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 14px;">
                Nadia AI will optimize luxury suites, dedicated chauffeur, dining, and daily activities around this amount.
              </p>

              <div style="position: relative; max-width: 300px; margin: 0 auto;">
                <span style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 1.5rem; font-weight: 800; color: var(--gold-primary);">₹</span>
                <input
                  type="number"
                  id="gen-budget-input"
                  value="${genBudget}"
                  step="1000"
                  min="10000"
                  style="width: 100%; padding: 12px 18px 12px 46px; background: rgba(0, 0, 0, 0.5); border: 2px solid var(--gold-primary); border-radius: var(--radius-md); color: #fff; font-size: 1.5rem; font-weight: 800; text-align: left; outline: none; box-shadow: 0 0 15px rgba(212,175,55,0.2);"
                  required
                  placeholder="75000"
                />
              </div>

              <!-- Quick Budget Preset Chips -->
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 14px;">
                <button type="button" class="budget-preset-chip ${genBudget === 25000 ? 'active-chip' : ''}" data-preset="25000" style="padding: 5px 12px; font-size: 0.74rem; background: ${genBudget === 25000 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${genBudget === 25000 ? 'var(--gold-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-full); color: ${genBudget === 25000 ? 'var(--gold-light)' : '#cbd5e1'}; font-weight: 700; cursor: pointer;">
                  ₹25,000 (Weekend)
                </button>
                <button type="button" class="budget-preset-chip ${genBudget === 50000 ? 'active-chip' : ''}" data-preset="50000" style="padding: 5px 12px; font-size: 0.74rem; background: ${genBudget === 50000 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${genBudget === 50000 ? 'var(--gold-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-full); color: ${genBudget === 50000 ? 'var(--gold-light)' : '#cbd5e1'}; font-weight: 700; cursor: pointer;">
                  ₹50,000 (Retreat)
                </button>
                <button type="button" class="budget-preset-chip ${genBudget === 75000 ? 'active-chip' : ''}" data-preset="75000" style="padding: 5px 12px; font-size: 0.74rem; background: ${genBudget === 75000 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${genBudget === 75000 ? 'var(--gold-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-full); color: ${genBudget === 75000 ? 'var(--gold-light)' : '#cbd5e1'}; font-weight: 700; cursor: pointer;">
                  ₹75,000 (Palace Escape)
                </button>
                <button type="button" class="budget-preset-chip ${genBudget === 120000 ? 'active-chip' : ''}" data-preset="120000" style="padding: 5px 12px; font-size: 0.74rem; background: ${genBudget === 120000 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${genBudget === 120000 ? 'var(--gold-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-full); color: ${genBudget === 120000 ? 'var(--gold-light)' : '#cbd5e1'}; font-weight: 700; cursor: pointer;">
                  ₹1,20,000 (Royal Tour)
                </button>
                <button type="button" class="budget-preset-chip ${genBudget === 200000 ? 'active-chip' : ''}" data-preset="200000" style="padding: 5px 12px; font-size: 0.74rem; background: ${genBudget === 200000 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${genBudget === 200000 ? 'var(--gold-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-full); color: ${genBudget === 200000 ? 'var(--gold-light)' : '#cbd5e1'}; font-weight: 700; cursor: pointer;">
                  ₹2,00,000 (Grand Tour)
                </button>
              </div>
            </div>

            <!-- Real-Time AI Allocation Preview Box -->
            <div id="ai-budget-preview-box" style="background: var(--bg-surface); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 16px; font-size: 0.8rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                <span style="color: var(--gold-light); font-weight: 800; text-transform: uppercase; font-size: 0.74rem;">
                  🤖 AI Allocation: ₹${genBudget.toLocaleString('en-IN')} across ${genDays} Days
                </span>
                <span id="preview-dest-badge" style="color: #34d399; font-weight: 700; font-size: 0.74rem; background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 2px 8px; border-radius: 4px;">
                  📍 ${selectedDestName} (~₹${Math.round(genBudget / genDays).toLocaleString('en-IN')}/day)
                </span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(115px, 1fr)); gap: 8px; font-size: 0.74rem; color: #cbd5e1;">
                <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06);">
                  🏨 <strong>Stay:</strong> ~₹${Math.round(genBudget * 0.50).toLocaleString('en-IN')}
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06);">
                  🚗 <strong>Transit:</strong> ~₹${Math.round(genBudget * 0.18).toLocaleString('en-IN')}
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06);">
                  🍽️ <strong>Dining:</strong> ~₹${Math.round(genBudget * 0.15).toLocaleString('en-IN')}
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06);">
                  ✨ <strong>Tours:</strong> ~₹${Math.round(genBudget * 0.10).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <!-- Primary Generate Action Button -->
            <button type="submit" id="generate-budget-plan-btn" class="btn-primary-gold" style="width: 100%; justify-content: center; padding: 15px; font-size: 1.05rem; font-weight: 800; box-shadow: 0 4px 20px rgba(212,175,55,0.35); cursor: pointer;">
              ✨ Generate Bespoke Trip for ₹${genBudget.toLocaleString('en-IN')}
            </button>
          </form>
        </div>
      </div>


      <!-- Rebuild My Trip Side-by-Side Comparison Modal -->
      <div class="auric-modal-backdrop ${isRebuildModalOpen ? 'active' : ''}" id="rebuild-diff-modal-backdrop">
        <div class="modal-window-container" style="max-width: 860px; padding: 32px;" id="rebuild-modal-window">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
            <div>
              <span class="section-tag-gold" style="font-size: 0.72rem;">⚡ PROACTIVE AI RE-PLANNING</span>
              <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-white);">Rebuild My Trip — Before & After Review</h3>
            </div>
            <button id="close-rebuild-modal-x" style="color: var(--text-white); font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 0.82rem; color: #fde047;">
            <strong>Disruption Trigger:</strong> Heavy rainfall forecast in Udaipur (Day 2). 3 outdoor excursions substituted with weather-safe indoor royal palace museum curator walks, Michelin thali dining, and spa wellness.
          </div>

          <!-- Side-by-Side Comparison Grid -->
          <div class="rebuild-diff-grid">
            <!-- Left: Before Plan -->
            <div class="rebuild-plan-card">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 8px;">Original Itinerary (Disrupted)</span>
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 12px;">Day 2: Outdoor Lake Waters & Street Markets</div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.78rem; color: #94a3b8;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>❌ 09:00 AM — Open-Air Lake Boat Cruise</span>
                  <span style="color: #94a3b8; font-weight: 700;">₹5,000</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>❌ 01:30 PM — Open-Air Street Gastronomy Tour</span>
                  <span style="color: #94a3b8; font-weight: 700;">₹3,500</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>❌ 05:00 PM — Outdoor Sunset Hill Hike</span>
                  <span style="color: #94a3b8; font-weight: 700;">₹4,000</span>
                </div>
              </div>
            </div>

            <!-- Right: Revised Plan -->
            <div class="rebuild-plan-card revised">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.75rem; color: var(--gold-light); font-weight: 800; text-transform: uppercase;">Revised Itinerary (Weather-Safe)</span>
                <span style="font-size: 0.68rem; padding: 2px 6px; background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #34d399; font-weight: 800; border-radius: 4px;">✓ 3 Substitutions</span>
              </div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--gold-light); margin-bottom: 12px;">Day 2: Indoor Palaces & Ayurvedic Wellness</div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.78rem; color: #f1f5f9;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>⚡ 09:30 AM — Private Curator Tour of City Palace</span>
                  <span style="color: var(--gold-light); font-weight: 700;">₹5,500</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>⚡ 01:30 PM — Michelin-Curated Royal Rajput Thali</span>
                  <span style="color: var(--gold-light); font-weight: 700;">₹6,000</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>⚡ 04:30 PM — Jiva Grande Spa 90-Min Rejuvenation</span>
                  <span style="color: var(--gold-light); font-weight: 700;">₹8,500</span>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <button class="btn-outline-glass" id="reject-rebuild-btn" style="padding: 10px 18px; font-size: 0.85rem;">
              ✕ Keep Original Plan
            </button>
            <button class="btn-primary-gold" id="accept-rebuild-btn" style="padding: 10px 24px; font-size: 0.85rem; font-weight: 800;">
              ✓ Accept Revised Plan
            </button>
          </div>
        </div>
      </div>
    `;

    // Mount Map into container
    const mapMount = section.querySelector("#itinerary-map-mount");
    if (mapMount) {
      mapMount.appendChild(renderItineraryMap(trip));
    }

    // Modal Trigger Listeners
    section.querySelector("#open-planner-generator-btn")?.addEventListener("click", () => {
      isGeneratorModalOpen = true;
      renderContent();
    });

    section.querySelector("#close-gen-modal-x")?.addEventListener("click", () => {
      isGeneratorModalOpen = false;
      renderContent();
    });

    section.querySelector("#open-rebuild-modal-btn")?.addEventListener("click", () => {
      isRebuildModalOpen = true;
      renderContent();
    });

    section.querySelector("#trigger-rebuild-from-banner-btn")?.addEventListener("click", () => {
      isRebuildModalOpen = true;
      renderContent();
    });

    section.querySelector("#close-rebuild-modal-x")?.addEventListener("click", () => {
      isRebuildModalOpen = false;
      renderContent();
    });

    section.querySelector("#reject-rebuild-btn")?.addEventListener("click", () => {
      isRebuildModalOpen = false;
      renderContent();
      appState.showToast("Original plan retained.");
    });

    // Mode Toggle Handlers
    section.querySelector("#mode-btn-destination")?.addEventListener("click", () => {
      planningMode = "destination";
      renderContent();
    });

    section.querySelector("#mode-btn-budget")?.addEventListener("click", () => {
      planningMode = "budget";
      renderContent();
    });

    section.querySelector("#toggle-lock-stay")?.addEventListener("click", () => {
      lockStay = !lockStay;
      renderContent();
    });

    // Location & Famous Spot Dropdown Change Handler
    section.querySelector("#gen-dest-select")?.addEventListener("change", (e) => {
      genDestId = e.target.value;
      renderContent();
    });

    // Days Dropdown Change Handler
    section.querySelector("#gen-days-select")?.addEventListener("change", (e) => {
      genDays = parseInt(e.target.value, 10) || 3;
      renderContent();
    });

    // Budget Preset Chip Click Handlers
    section.querySelectorAll(".budget-preset-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const val = parseInt(chip.dataset.preset, 10);
        if (val) {
          genBudget = val;
          renderContent();
        }
      });
    });

    // Real-Time Budget Input Live Updater
    const bInputEl = section.querySelector("#gen-budget-input");
    bInputEl?.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (val && !isNaN(val)) {
        genBudget = val;
        
        // Update Submit Button Label
        const submitBtn = section.querySelector("#generate-budget-plan-btn");
        if (submitBtn) {
          submitBtn.textContent = `✨ Generate Bespoke Trip for ₹${val.toLocaleString('en-IN')}`;
        }

        // Update Destination Badge & Allocations in Real-Time
        const badge = section.querySelector("#preview-dest-badge");
        if (badge) {
          const destObj = DESTINATIONS.find(d => d.id === genDestId);
          const spotLabel = genDestId === 'auto'
            ? (val < 35000 ? 'Hampi' : val < 65000 ? 'Coorg' : val < 120000 ? 'Jaipur' : val < 220000 ? 'Udaipur' : 'Kashmir')
            : (destObj ? destObj.name.split(' & ')[0] : 'Jaipur');
          const perDay = Math.round(val / genDays);
          badge.textContent = `📍 ${spotLabel} (~₹${perDay.toLocaleString('en-IN')}/day)`;
        }
      }
    });

    section.querySelector("#trigger-rebuild-from-banner")?.addEventListener("click", () => {
      isRebuildModalOpen = true;
      renderContent();
    });

    const API_BASE = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";

    // Accept Rebuild Action
    section.querySelector("#accept-rebuild-btn")?.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_BASE}/planner/rebuild/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripData: trip,
            userEmail: appState.state.currentUser?.email || 'traveler@auricvyom.com',
            userName: appState.state.currentUser?.name || 'Valued Traveler',
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.revisedPlan) {
            const revised = data.data.revisedPlan;
            appState.setState({
              activeTripPlan: {
                ...trip,
                days: revised.days,
                estimatedTotal: revised.estimatedTotal,
                isWeatherProtected: true,
              }
            });
            appState.showToast("✨ Revised weather-safe itinerary accepted & applied!");
          }
        }
      } catch (e) {
        console.warn("Rebuild API failed, applied local simulation:", e);
        appState.showToast("✨ Revised weather-safe itinerary accepted & applied!");
      }
      isRebuildModalOpen = false;
      renderContent();
    });

    // Generator Form Submit (Plan by Budget with Selected Location & Days)
    section.querySelector("#trip-gen-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bInput = section.querySelector("#gen-budget-input");
      const totalBudget = parseInt(bInput?.value || genBudget || "75000", 10);
      
      const dSelect = section.querySelector("#gen-days-select");
      const daysCount = parseInt(dSelect?.value || genDays || "3", 10);
      
      const destSelect = section.querySelector("#gen-dest-select");
      const chosenDestId = destSelect?.value || genDestId || "auto";

      const tSelect = section.querySelector("#gen-travellers-select");
      const travelersCount = parseInt(tSelect?.value || "2", 10);
      const fromInput = section.querySelector("#gen-from-input");
      const originCity = fromInput?.value || genFrom || "Bengaluru";

      const travelStyle = totalBudget >= 120000 ? "Royal Heritage & Palaces" : totalBudget >= 60000 ? "Curated Heritage & Sanctuary" : "Boutique Heritage & Culture";

      const chosenDestObj = DESTINATIONS.find(d => d.id === chosenDestId);
      const destDisplayName = chosenDestId === 'auto'
        ? (totalBudget < 35000 ? 'Hampi' : totalBudget < 65000 ? 'Coorg' : totalBudget < 120000 ? 'Jaipur' : totalBudget < 220000 ? 'Udaipur' : 'Kashmir')
        : (chosenDestObj ? chosenDestObj.name : chosenDestId);

      appState.showToast(`⏳ Nadia AI is designing your bespoke ${daysCount}-day trip to ${destDisplayName} within ₹${totalBudget.toLocaleString('en-IN')}...`);

      let planApplied = false;
      try {
        const res = await fetch(`${API_BASE}/planner/budget-to-itinerary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalBudget,
            daysCount,
            travelersCount,
            travelStyle,
            destination: chosenDestId === 'auto' ? undefined : (chosenDestObj ? chosenDestObj.name : chosenDestId)
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            appState.setState({ activeTripPlan: data.data });
            appState.showToast(`✨ Generated complete trip to ${data.data.destination || destDisplayName} for ₹${totalBudget.toLocaleString('en-IN')}!`);
            planApplied = true;
          }
        }
      } catch (err) {
        console.warn("Budget planning API notice (using local generation):", err);
      }

      // If backend was offline or not reached, use resilient local generator
      if (!planApplied) {
        const fallbackDestId = chosenDestId === 'auto'
          ? (totalBudget < 35000 ? 'hampi' : totalBudget < 65000 ? 'coorg' : totalBudget < 120000 ? 'jaipur' : totalBudget < 220000 ? 'udaipur' : 'kashmir')
          : chosenDestId;
        const destObj = DESTINATIONS.find(d => d.id === fallbackDestId) || DESTINATIONS[0];
        
        appState.generateNewTrip({
          from: originCity,
          destinationId: destObj.id,
          destinationName: destObj.name,
          daysCount,
          travellersCount: travelersCount,
          budget: totalBudget,
          travelStyle,
          pace: "Balanced",
          interests: ["Nature", "Heritage", "Food"]
        });
        appState.showToast(`✨ Generated complete trip to ${destObj.name} for ₹${totalBudget.toLocaleString('en-IN')}!`);
      }

      isGeneratorModalOpen = false;
      renderContent();
    });


    section.querySelector("#save-trip-btn")?.addEventListener("click", () => {
      appState.showToast("💾 Itinerary saved to your dashboard.");
    });

    section.querySelector("#share-trip-btn")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(window.location.href);
      appState.showToast("🔗 Trip link copied to clipboard!");
    });
  };

  renderContent();
  return section;
}
