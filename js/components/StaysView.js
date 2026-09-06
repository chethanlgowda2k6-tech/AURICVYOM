// AURICVYOM Stays Marketplace Component with Shareable URL Query String & Multi-Currency Engine
import { STAYS } from "../data/stays.js";
import { appState } from "../state.js";

export function renderStaysView() {
  const section = document.createElement("section");
  section.className = "section-spacing";
  section.id = "stays-section";

  // Hydrate search filters from URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  let searchDest = urlParams.get("dest") || "";
  let selectedCategory = urlParams.get("type") || urlParams.get("cat") || "all";
  let selectedAmenities = urlParams.get("amenities") ? urlParams.get("amenities").split(",") : [];

  const syncUrlParams = () => {
    const params = new URLSearchParams();
    if (searchDest.trim()) params.set("dest", searchDest.trim());
    if (selectedCategory !== "all") params.set("type", selectedCategory);
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const hash = window.location.hash || "#stays";
    history.replaceState(null, "", `${window.location.pathname}${queryString}${hash}`);
  };

  const renderContent = () => {
    syncUrlParams();

    // Filter stays
    const filteredStays = STAYS.filter(stay => {
      if (selectedCategory !== "all" && stay.propertyType !== selectedCategory) return false;
      if (searchDest.trim()) {
        const q = searchDest.toLowerCase();
        if (!stay.name.toLowerCase().includes(q) && !stay.destinationName.toLowerCase().includes(q) && !(stay.location || "").toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedAmenities.length > 0) {
        const matchesAll = selectedAmenities.every(a => stay.amenities.some(sa => sa.toLowerCase().includes(a.toLowerCase())));
        if (!matchesAll) return false;
      }
      return true;
    });

    section.innerHTML = `
      <div class="content-container">
        <!-- Section Header -->
        <div class="section-header-block">
          <div>
            <span class="section-tag-gold">🏨 SANCTUARIES & HERITAGE ESTATES</span>
            <h2 class="section-main-title">Luxury Stays & Villas of India</h2>
            <p class="section-desc-muted">
              Discover private royal palace suites, Himalayan mountain retreats, coastal Goa villas, and backwater sanctuaries across all states of India.
            </p>
          </div>

          <div style="color: var(--gold-light); font-size: 0.95rem; font-weight: 600;">
            <span>${filteredStays.length} Stays Available</span>
          </div>
        </div>

        <!-- Stays Top Search Bar -->
        <div style="background: var(--bg-surface); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 28px; box-shadow: var(--shadow-md);">
          <div class="stays-search-grid">
            <!-- Destination Input -->
            <div>
              <label style="font-size: 0.7rem; color: var(--gold-light); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Destination / Stay / State</label>
              <input 
                type="text" 
                id="stays-search-dest-input" 
                value="${searchDest}" 
                placeholder="Jaipur, Mumbai, Udaipur, Goa, Kerala, Srinagar, Delhi, Shimla, Coorg..." 
                style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; color: var(--text-white); font-size: 1rem; outline: none;"
              />
            </div>

            <!-- Check-in -->
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Check-in</label>
              <input 
                type="date" 
                value="${new Date().toISOString().split('T')[0]}" 
                style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; color: var(--text-white); font-size: 1rem; outline: none;"
              />
            </div>

            <!-- Check-out -->
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Check-out</label>
              <input 
                type="date" 
                value="${new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]}" 
                style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; color: var(--text-white); font-size: 1rem; outline: none;"
              />
            </div>

            <!-- Guests & Rooms -->
            <div>
              <label style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Guests & Rooms</label>
              <select style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; color: var(--text-white); font-size: 1rem; outline: none; cursor: pointer;">
                <option value="2-1">2 Guests, 1 Room</option>
                <option value="1-1">1 Guest, 1 Room</option>
                <option value="4-2">4 Guests, 2 Rooms</option>
                <option value="6-3">6 Guests, Villa</option>
              </select>
            </div>

            <!-- Search Button -->
            <div style="align-self: flex-end;">
              <button class="btn-primary-gold" id="stays-search-filter-btn" style="padding: 12px 24px; font-size: 0.92rem; min-height: 48px;">
                🔍 Search Stays
              </button>
            </div>
          </div>
        </div>

        <!-- 8 Property Type Categories -->
        <div class="filter-tabs-pills" style="margin-bottom: 18px;">
          ${[
            { id: "all", label: "🌟 All Stays" },
            { id: "Hotels", label: "🏨 Hotels" },
            { id: "Resort", label: "🌴 Resorts" },
            { id: "Homestays", label: "🏡 Homestays" },
            { id: "Villas", label: "🏰 Villas" },
            { id: "Hostels", label: "🎒 Hostels" },
            { id: "Luxury", label: "⚜️ Luxury Stays" },
            { id: "Unique", label: "✨ Unique Stays" }
          ].map(c => `
            <button class="filter-pill-btn ${selectedCategory === c.id ? 'active' : ''}" data-stay-cat="${c.id}">
              ${c.label}
            </button>
          `).join("")}
        </div>

        <!-- Amenities Filter Pills Row -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; align-items: center;">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Quick Amenities:</span>
          ${[
            "Breakfast Included",
            "Swimming Pool",
            "Free High-Speed Wi-Fi",
            "Jiva Grande Spa",
            "Spa & Ayurveda",
            "Valet Parking"
          ].map(am => `
            <button class="amenity-chip-btn ${selectedAmenities.includes(am) ? 'active' : ''}" data-am="${am}" style="padding: 6px 14px; font-size: 0.78rem; border-radius: var(--radius-full); border: 1px solid ${selectedAmenities.includes(am) ? 'var(--gold-primary)' : 'var(--border-subtle)'}; background: ${selectedAmenities.includes(am) ? 'rgba(212,175,55,0.15)' : 'transparent'}; color: ${selectedAmenities.includes(am) ? 'var(--gold-light)' : 'var(--text-secondary)'}; cursor: pointer;">
              ${selectedAmenities.includes(am) ? '✓ ' : '+ '}${am}
            </button>
          `).join("")}
          ${(selectedAmenities.length > 0 || searchDest || selectedCategory !== "all") ? `
            <button id="clear-stays-filter-btn" style="background: none; border: none; color: #f43f5e; font-size: 0.78rem; cursor: pointer; text-decoration: underline; margin-left: 8px;">
              Reset Filters
            </button>
          ` : ''}
        </div>

        <!-- Stays Grid -->
        <div class="destinations-grid">
          ${filteredStays.map(stay => {
            let distanceBadgeHtml = "";
            if (appState.state.userLocation) {
              const { lat, lng } = appState.state.userLocation;
              let pLat = 26.9124, pLng = 75.7873;
              if (stay.name.includes("Rambagh") || stay.destinationName.includes("Jaipur")) { pLat = 26.9124; pLng = 75.7873; }
              else if (stay.name.includes("Lake Palace") || stay.destinationName.includes("Udaipur")) { pLat = 24.5854; pLng = 73.7125; }
              else if (stay.name.includes("Exotica") || stay.destinationName.includes("Goa")) { pLat = 15.4909; pLng = 73.8278; }
              else if (stay.name.includes("Tamara") || stay.destinationName.includes("Coorg")) { pLat = 12.3375; pLng = 75.8069; }
              else if (stay.name.includes("Wildflower") || stay.destinationName.includes("Shimla")) { pLat = 31.1048; pLng = 77.1734; }
              else if (stay.name.includes("Leela") || stay.destinationName.includes("Bengaluru")) { pLat = 12.9716; pLng = 77.5946; }
              
              const distKm = appState.calculateDistanceKm(lat, lng, pLat, pLng);
              distanceBadgeHtml = `<span class="stay-distance-badge">📍 ${distKm} km from you</span>`;
            }

            return `
              <div class="luxury-card stay-card-hover" data-stay-id="${stay.id}">
                <div class="card-image-wrap">
                  <img src="${stay.image}" alt="${stay.name}" class="card-img" loading="lazy" />
                  <div class="card-gradient-overlay"></div>
                  <div class="card-category-badge">
                    <span>${stay.category}</span>
                  </div>
                  <div class="card-actions-top">
                    <button class="card-wishlist-btn ${appState.isWishlisted(stay.id) ? 'active' : ''}" data-stay-id="${stay.id}" title="Save to Wishlist">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="${appState.isWishlisted(stay.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="card-rating-badge" style="position: absolute; bottom: 12px; right: 16px; z-index: 3;">
                    <span>★</span>
                    <span>${stay.rating}</span>
                  </div>
                </div>

                <div class="card-content-body">
                  <div>
                    <h3 class="card-destination-name">${stay.name}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <span style="font-size: 0.82rem; color: var(--gold-light); font-weight: 600;">📍 ${stay.destinationName}</span>
                      ${distanceBadgeHtml}
                    </div>
                    <p class="card-tagline-text">${stay.description}</p>
                    
                    <div class="card-vibes-row">
                      ${stay.amenities.slice(0, 3).map(a => `<span class="vibe-tag">✓ ${a}</span>`).join("")}
                    </div>
                  </div>

                  <div class="card-footer-meta" style="flex-direction: column; align-items: stretch; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <div>
                        <div class="price-label-small">Per Night</div>
                        <div class="price-value-bold">${appState.formatPrice(stay.pricePerNight)}</div>
                      </div>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">+ ${appState.formatPrice(stay.taxesAndFees || Math.round(stay.pricePerNight * 0.18))} taxes/fees</span>
                    </div>

                    <div style="display: flex; gap: 10px;">
                      <button class="btn-outline-glass view-stay-details-btn" data-stay-id="${stay.id}" style="flex: 1; justify-content: center; padding: 10px; font-size: 0.85rem;">
                        View Details
                      </button>
                      <button class="btn-primary-gold reserve-stay-now-btn" data-stay-id="${stay.id}" style="flex: 1; justify-content: center; padding: 10px; font-size: 0.85rem;">
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Listeners
    section.querySelector("#stays-search-dest-input")?.addEventListener("input", (e) => {
      searchDest = e.target.value;
    });

    section.querySelector("#stays-search-dest-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") renderContent();
    });

    section.querySelector("#stays-search-filter-btn")?.addEventListener("click", () => {
      renderContent();
    });

    section.querySelector("#clear-stays-filter-btn")?.addEventListener("click", () => {
      searchDest = "";
      selectedCategory = "all";
      selectedAmenities = [];
      renderContent();
    });

    section.querySelectorAll("[data-stay-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.stayCat;
        renderContent();
      });
    });

    section.querySelectorAll(".amenity-chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const am = btn.dataset.am;
        const idx = selectedAmenities.indexOf(am);
        if (idx !== -1) {
          selectedAmenities.splice(idx, 1);
        } else {
          selectedAmenities.push(am);
        }
        renderContent();
      });
    });

    // View Details triggers StayDetailModal
    section.querySelectorAll(".view-stay-details-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const stayId = btn.dataset.stayId;
        const stay = STAYS.find(s => s.id === stayId);
        if (stay) {
          appState.openStayDetail(stay);
        }
      });
    });

    // Clicking the stay card also opens details
    section.querySelectorAll(".luxury-card.stay-card-hover").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target.closest(".card-wishlist-btn")) return;
        const stayId = card.dataset.stayId;
        const stay = STAYS.find(s => s.id === stayId);
        if (stay) {
          appState.openStayDetail(stay);
        }
      });
    });

    // Reserve CTA triggers checkout modal
    section.querySelectorAll(".reserve-stay-now-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const stayId = btn.dataset.stayId;
        const stay = STAYS.find(s => s.id === stayId);
        if (stay) {
          appState.openBooking(stay, "stay");
        }
      });
    });

    // Wishlist Toggle
    section.querySelectorAll(".card-wishlist-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const stayId = btn.dataset.stayId;
        const stay = STAYS.find(s => s.id === stayId);
        if (stay) {
          appState.toggleWishlist({
            id: stay.id,
            name: stay.name,
            type: "stay",
            image: stay.image,
            country: "India",
            state: stay.destinationName.split(",")[1]?.trim() || "India",
            rating: stay.rating,
            startingPrice: `₹${stay.pricePerNight.toLocaleString('en-IN')}`
          });
        }
      });
    });
  };

  appState.subscribe(() => {
    renderContent();
  });

  renderContent();
  return section;
}
