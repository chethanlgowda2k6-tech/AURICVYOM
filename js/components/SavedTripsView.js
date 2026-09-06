// AURICVYOM Saved Trips & Wishlist Component with Price-Drop & Availability Alerts
import { appState } from "../state.js";
import { STAYS } from "../data/stays.js";

export function renderSavedTripsView() {
  const section = document.createElement("section");
  section.className = "section-spacing";
  section.id = "saved-trips-section";

  const renderContent = () => {
    const { wishlist } = appState.getState();

    section.innerHTML = `
      <div class="content-container">
        <!-- Section Header -->
        <div class="section-header-block">
          <div>
            <span class="section-tag-gold">❤️ YOUR CURATED WISHLIST & ALERTS</span>
            <h2 class="section-main-title">Saved Escapes & Live Alerts</h2>
            <p class="section-desc-muted">
              Track your saved royal palaces, mountain villas, and boutique retreats with automated price-drop notifications and date availability monitoring.
            </p>
          </div>

          <div style="color: var(--gold-light); font-size: 0.95rem; font-weight: 600;">
            <span>${wishlist.length} Items Saved</span>
          </div>
        </div>

        <!-- Wishlist Grid -->
        ${wishlist.length === 0 ? `
          <div style="text-align: center; padding: 80px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1.5px dashed var(--border-gold); max-width: 650px; margin: 0 auto;">
            <div style="font-size: 3.5rem; margin-bottom: 16px;">✨</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-white); margin-bottom: 8px;">Your Wishlist is Empty</h3>
            <p style="color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">
              Explore our curated portfolio of Indian destinations and luxury sanctuaries, and click the heart icon on any stay to save it here and track price alerts.
            </p>
            <button class="btn-primary-gold" id="explore-from-saved-btn">
              Explore Sanctuaries
            </button>
          </div>
        ` : `
          <div class="destinations-grid" id="saved-cards-grid">
            ${wishlist.map(item => `
              <div class="luxury-card" style="display: flex; flex-direction: column;">
                <div class="card-image-wrap">
                  <img src="${item.image}" alt="${item.name}" class="card-img" />
                  <div class="card-gradient-overlay"></div>
                  <div class="card-category-badge">
                    <span>${item.type?.toUpperCase() || 'SANCTUARY'}</span>
                  </div>
                  <div class="card-actions-top">
                    <button class="card-wishlist-btn active remove-wishlist-btn" data-id="${item.id}" title="Remove from wishlist">
                      ❤️
                    </button>
                  </div>
                  <div class="card-rating-badge" style="position: absolute; bottom: 12px; right: 16px; z-index: 3;">
                    <span>★ ${item.rating || '4.95'}</span>
                  </div>
                </div>

                <div class="card-content-body" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <h3 class="card-destination-name">${item.name}</h3>
                    <p style="font-size: 0.82rem; color: var(--gold-light); margin-bottom: 12px;">📍 ${item.state || 'India'}</p>

                    <!-- Price Drop & Availability Alerts Control Box -->
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.78rem; color: var(--text-white); font-weight: 600;">🔔 Price-Drop Alert:</span>
                        <button class="toggle-price-alert-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 0.74rem; font-weight: 700; border-radius: var(--radius-full); border: 1px solid ${item.priceAlert ? 'var(--emerald-accent)' : 'var(--border-subtle)'}; background: ${item.priceAlert ? 'rgba(16,185,129,0.15)' : 'transparent'}; color: ${item.priceAlert ? '#34d399' : 'var(--text-muted)'}; cursor: pointer;">
                          ${item.priceAlert ? '● Active Alert' : '○ Enable'}
                        </button>
                      </div>

                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.78rem; color: var(--text-white); font-weight: 600;">📅 Date Availability Alert:</span>
                        <button class="toggle-avail-alert-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 0.74rem; font-weight: 700; border-radius: var(--radius-full); border: 1px solid ${item.availabilityAlert ? 'var(--emerald-accent)' : 'var(--border-subtle)'}; background: ${item.availabilityAlert ? 'rgba(16,185,129,0.15)' : 'transparent'}; color: ${item.availabilityAlert ? '#34d399' : 'var(--text-muted)'}; cursor: pointer;">
                          ${item.availabilityAlert ? '● Active Alert' : '○ Enable'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer-meta" style="flex-direction: column; align-items: stretch; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <div>
                        <div class="price-label-small">Starting Rate</div>
                        <div class="price-value-bold">${item.startingPrice || '₹24,500'}</div>
                      </div>
                    </div>

                    <button class="btn-primary-gold saved-book-now-btn" data-id="${item.id}" style="width: 100%; justify-content: center; padding: 10px; font-size: 0.88rem;">
                      Reserve Now
                    </button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;

    // Listeners
    section.querySelector("#explore-from-saved-btn")?.addEventListener("click", () => {
      appState.setActiveTab("stays");
    });

    section.querySelectorAll(".remove-wishlist-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = wishlist.find(x => x.id === id);
        if (item) appState.toggleWishlist(item);
      });
    });

    section.querySelectorAll(".toggle-price-alert-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        appState.toggleWishlistAlert(id, "price");
      });
    });

    section.querySelectorAll(".toggle-avail-alert-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        appState.toggleWishlistAlert(id, "availability");
      });
    });

    section.querySelectorAll(".saved-book-now-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const stay = STAYS.find(s => s.id === id) || {
          id,
          name: "Curated Luxury Sanctuary",
          pricePerNight: 28500,
          destinationName: "India",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
        };
        appState.openBooking(stay, "stay");
      });
    });
  };

  appState.subscribe(() => {
    if (appState.getState().activeTab === "saved") {
      renderContent();
    }
  });

  renderContent();
  return section;
}
