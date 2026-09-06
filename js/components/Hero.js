// AURICVYOM Automatic Indian State Capitals Hero Carousel & Mobile-First Travel Search
import { appState } from "../state.js";
import { INDIAN_STATE_CAPITALS } from "../data/capitalCities.js";

export function renderHero() {
  const heroContainer = document.createElement("section");
  heroContainer.className = "poster-hero";
  heroContainer.id = "hero-section";
  heroContainer.style.cssText = "height: 660px !important; min-height: 600px !important; max-height: 680px !important; overflow: visible !important;";

  let currentIndex = 0;
  let timer = null;
  let progressTimer = null;
  const slideDuration = 4500; // 4.5 seconds per slide
  let progressPercent = 0;
  const totalSlides = INDIAN_STATE_CAPITALS.length;

  // Build Hero DOM
  heroContainer.innerHTML = `
    <!-- Top Progress Indicator Bar -->
    <div class="hero-slider-progress-track">
      <div class="hero-slider-progress-fill" id="hero-progress-bar"></div>
    </div>

    <!-- Cinematic Background Slide Layers (All 28 Capitals + Delhi) -->
    <div class="hero-bg-layer" id="hero-bg-slides-wrapper">
      ${INDIAN_STATE_CAPITALS.map((slide, idx) => `
        <div class="hero-bg-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
          <img 
            src="${slide.bgImage}?v=2.0.2" 
            alt="${slide.city} — ${slide.famousLandmarks}, ${slide.state}" 
            class="hero-bg-image"
            loading="eager"
          />
        </div>
      `).join('')}
      <div class="hero-gradient-overlay"></div>
      <div class="hero-vignette"></div>
    </div>

    <!-- Curved Flight Path SVG -->
    <svg class="hero-flight-path-svg" viewBox="0 0 2000 700" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        id="flight-path-curve" 
        class="flight-curve-dashed" 
        d="M 100,550 C 450,220 850,520 1350,180 C 1600,60 1850,250 2000,120" 
      />
      <g class="animated-flight-plane">
        <path d="M-12,-8 L14,0 L-12,8 L-6,0 Z" fill="#d4af37" filter="drop-shadow(0 0 8px rgba(212,175,55,0.8))"/>
        <circle cx="14" cy="0" r="3" fill="#ffffff" />
      </g>
    </svg>

    <!-- Floating Decorative Seal & Region Tag (Desktop only) -->
    <div class="hero-floating-elements">
      <div class="floating-circular-seal" title="AuricVyom Royal India Bespoke Travel">
        <span class="seal-inner-icon">⚜️</span>
        <span class="seal-text">AURICVYOM<br/>LUXURY</span>
      </div>

      <div class="floating-weather-tag" id="hero-weather-tag">
        <span id="hero-region-badge">📍 ${INDIAN_STATE_CAPITALS[0].region}</span>
        <span style="color: var(--gold-primary);">•</span>
        <span id="hero-landmarks-short">🏛️ ${INDIAN_STATE_CAPITALS[0].famousLandmarks.split('•')[0].trim()}</span>
      </div>
    </div>

    <!-- Center Hero Editorial Content -->
    <div class="hero-center-content" id="hero-dynamic-content">
      <!-- Tagline Subtitle Pill -->
      <div class="hero-subtitle-pill">
        <span>✨ INDIA STATE CAPITALS • LUXURY BESPOKE DISCOVERY</span>
      </div>

      <!-- Landmark Spotlight Badge -->
      <div>
        <div class="hero-landmark-pill" id="hero-landmark-pill">
          <span class="landmark-icon">📍</span>
          <span>Famous Landmark: <strong class="landmark-spot" id="hero-landmark-text">${INDIAN_STATE_CAPITALS[0].famousLandmarks}</strong></span>
        </div>
      </div>

      <!-- City Name in Large Elegant Typography -->
      <h1 class="hero-city-title" id="hero-city-title">
        <span>${INDIAN_STATE_CAPITALS[0].city}</span>
      </h1>

      <!-- State Name Directly Below City Name -->
      <div class="hero-state-subtitle" id="hero-state-subtitle">
        ${INDIAN_STATE_CAPITALS[0].state}
      </div>

      <!-- Attractive Travel Tagline -->
      <p class="hero-travel-tagline" id="hero-travel-tagline">
        "${INDIAN_STATE_CAPITALS[0].tagline}"
      </p>

      <!-- Action Row: Explore Now + Chevrons & Dots -->
      <div class="hero-actions-row">
        <div class="hero-cta-group">
          <button class="btn-primary-gold" id="hero-explore-btn">
            <span id="hero-explore-btn-label">Explore ${INDIAN_STATE_CAPITALS[0].city}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <button class="btn-outline-glass" id="hero-plan-trip-btn">
            <span>✨ Plan Itinerary</span>
          </button>
        </div>

        <!-- Left / Right Navigation Chevrons -->
        <div class="hero-slider-arrows">
          <button class="hero-slide-nav-btn" id="hero-prev-btn" title="Previous City" aria-label="Previous Slide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <span class="hero-slide-counter-badge" id="hero-slide-counter">
            1 / ${totalSlides}
          </span>

          <button class="hero-slide-nav-btn" id="hero-next-btn" title="Next City" aria-label="Next Slide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Carousel Progress Dots (All 29 State Capitals) -->
      <div class="hero-carousel-dots" id="hero-carousel-dots">
        ${INDIAN_STATE_CAPITALS.map((_, idx) => `
          <button class="hero-dot-btn ${idx === 0 ? 'active' : ''}" data-dot-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>
        `).join('')}
      </div>
    </div>

    <!-- Modern Travel Search Card (Mobile-First & Desktop High Precision) -->
    <div class="travel-search-card" id="travel-search-bar">
      <!-- Destination Input with Location-Based Multi-Destination Picker -->
      <div class="search-field-block" id="search-dest-block" style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 4px;">
          <span class="search-field-label" style="margin-bottom: 0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Where to?
          </span>
          <button type="button" class="nearby-loc-trigger-btn" id="hero-use-location-btn" title="Discover luxury destinations near your current location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span>Use my location</span>
          </button>
        </div>

        <div id="search-dest-input-container" style="display: flex; align-items: center; width: 100%;">
          ${appState.state.selectedNearbyDestination ? `
            <div class="nearby-active-chip" id="hero-nearby-active-chip">
              <span>📍 Near ${appState.state.selectedNearbyDestination.name} (${appState.state.selectedNearbyDestination.distanceKm} km away)</span>
              <button type="button" class="chip-clear-btn" id="hero-clear-nearby-chip-btn" title="Clear location filter">✕</button>
            </div>
          ` : `
            <input 
              type="text" 
              id="search-dest-input" 
              class="search-field-input" 
              placeholder="e.g. Jaipur, Goa, Bengaluru..." 
              value="${appState.state.searchQuery || ''}"
              autocomplete="off"
            />
          `}
        </div>

        <!-- Autocomplete Dropdown -->
        <div class="search-suggestions-dropdown" id="search-suggestions-dropdown"></div>

        <!-- Nearby Destinations Dropdown / Picker -->
        <div class="nearby-dest-dropdown" id="nearby-dest-dropdown" style="display: none;"></div>
      </div>

      <!-- Check-in Date -->
      <div class="search-field-block">
        <span class="search-field-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Check-in
        </span>
        <input 
          type="date" 
          id="search-checkin-input" 
          class="search-field-input" 
          value="${new Date().toISOString().split('T')[0]}"
        />
      </div>

      <!-- Check-out Date -->
      <div class="search-field-block">
        <span class="search-field-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Check-out
        </span>
        <input 
          type="date" 
          id="search-checkout-input" 
          class="search-field-input" 
          value="${new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]}"
        />
      </div>

      <!-- Guests Count -->
      <div class="search-field-block">
        <span class="search-field-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Guests
        </span>
        <select id="search-guests-input" class="search-field-input" style="cursor: pointer; appearance: auto;">
          <option value="1">1 Guest (Solo Traveler)</option>
          <option value="2" selected>2 Guests (Couple / Pair)</option>
          <option value="3">3 Guests (Small Group)</option>
          <option value="4">4 Guests (Family Suite)</option>
          <option value="6">6+ Guests (Private Villa)</option>
        </select>
      </div>

      <!-- Experience Type Dropdown -->
      <div class="search-field-block">
        <span class="search-field-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Experience Type
        </span>
        <select id="search-type-input" class="search-field-input" style="cursor: pointer; appearance: auto;">
          <option value="all">🌟 All Categories</option>
          <option value="palace">👑 Heritage Palaces</option>
          <option value="hills">🏔️ Hill Stations & Tea</option>
          <option value="coastal">🌴 Coastal & Backwaters</option>
          <option value="wildlife">🐅 Private Jungle Safaris</option>
          <option value="spiritual">🪔 Sacred Architecture</option>
        </select>
      </div>

      <!-- Search Submit Button -->
      <div class="search-submit-block">
        <button class="search-submit-btn" id="hero-search-submit-btn" aria-label="Search Luxury Stays">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search</span>
        </button>
      </div>
    </div>

    <!-- Quick AI Smart Launchers -->
    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 18px; z-index: 5; position: relative;">
      <button type="button" class="nearby-loc-trigger-btn" id="hero-photo-trip-btn" style="background: rgba(212,175,55,0.18); font-size: 0.78rem; padding: 6px 14px;">
        📸 <strong>Photo-to-Trip</strong>: Start from a Landmark Photo
      </button>
      <button type="button" class="nearby-loc-trigger-btn" id="hero-budget-planner-btn" style="background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; font-size: 0.78rem; padding: 6px 14px;">
        💰 <strong>Reverse Budget Planner</strong>
      </button>
      <button type="button" class="nearby-loc-trigger-btn" id="hero-rebuild-trip-btn" style="background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); color: #fde047; font-size: 0.78rem; padding: 6px 14px;">
        ⚡ <strong>Rebuild My Trip</strong> (Disruption AI)
      </button>
    </div>
  `;

  // Dynamic Element References
  const bgSlides = heroContainer.querySelectorAll(".hero-bg-slide");
  const dotBtns = heroContainer.querySelectorAll(".hero-dot-btn");
  const progressBar = heroContainer.querySelector("#hero-progress-bar");
  const cityTitle = heroContainer.querySelector("#hero-city-title");
  const stateSubtitle = heroContainer.querySelector("#hero-state-subtitle");
  const travelTagline = heroContainer.querySelector("#hero-travel-tagline");
  const landmarkText = heroContainer.querySelector("#hero-landmark-text");
  const regionBadge = heroContainer.querySelector("#hero-region-badge");
  const landmarksShort = heroContainer.querySelector("#hero-landmarks-short");
  const exploreLabel = heroContainer.querySelector("#hero-explore-btn-label");
  const slideCounter = heroContainer.querySelector("#hero-slide-counter");
  const dynamicContent = heroContainer.querySelector("#hero-dynamic-content");

  const updateSlide = (index) => {
    currentIndex = (index + totalSlides) % totalSlides;
    const current = INDIAN_STATE_CAPITALS[currentIndex];

    // 1. Crossfade & Ken-Burns Zoom Background
    bgSlides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add("active");
        const img = slide.querySelector("img");
        const targetSrc = current.bgImage + "?v=2.0.2";
        if (img && img.getAttribute("src") !== targetSrc) {
          img.setAttribute("src", targetSrc);
        }
      } else {
        slide.classList.remove("active");
      }
    });

    // 2. Animate Dynamic Content
    if (dynamicContent) {
      dynamicContent.classList.remove("hero-content-fade");
      void dynamicContent.offsetWidth;
      dynamicContent.classList.add("hero-content-fade");
    }

    if (cityTitle) cityTitle.innerHTML = `<span>${current.city}</span>`;
    if (stateSubtitle) stateSubtitle.textContent = current.state;
    if (travelTagline) travelTagline.textContent = `"${current.tagline}"`;
    if (landmarkText) landmarkText.textContent = current.famousLandmarks;
    if (regionBadge) regionBadge.textContent = `📍 ${current.region}`;
    if (landmarksShort) landmarksShort.textContent = `🏛️ ${current.famousLandmarks.split('•')[0].trim()}`;
    if (exploreLabel) exploreLabel.textContent = `Explore ${current.city}`;
    if (slideCounter) slideCounter.textContent = `${currentIndex + 1} / ${totalSlides}`;

    // 3. Update Dots
    dotBtns.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    resetProgressBar();
  };

  const resetProgressBar = () => {
    progressPercent = 0;
    if (progressBar) progressBar.style.width = "0%";
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    const intervalTime = 100;
    const step = (intervalTime / slideDuration) * 100;

    progressTimer = setInterval(() => {
      progressPercent += step;
      if (progressBar) progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
      if (progressPercent >= 100) {
        updateSlide(currentIndex + 1);
      }
    }, intervalTime);
  };

  const stopAutoPlay = () => {
    if (progressTimer) clearInterval(progressTimer);
    if (timer) clearTimeout(timer);
  };

  startAutoPlay();

  heroContainer.addEventListener("mouseenter", stopAutoPlay);
  heroContainer.addEventListener("mouseleave", startAutoPlay);

  // Chevron Controls
  heroContainer.querySelector("#hero-prev-btn")?.addEventListener("click", () => {
    updateSlide(currentIndex - 1);
    startAutoPlay();
  });
  heroContainer.querySelector("#hero-next-btn")?.addEventListener("click", () => {
    updateSlide(currentIndex + 1);
    startAutoPlay();
  });

  // Dots Navigation
  dotBtns.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.dataset.dotIndex, 10);
      updateSlide(idx);
      startAutoPlay();
    });
  });

  // Mobile Touch Swipe Gestures
  let touchStartX = 0;
  let touchEndX = 0;

  heroContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  heroContainer.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        updateSlide(currentIndex + 1);
      } else {
        updateSlide(currentIndex - 1);
      }
    }
    startAutoPlay();
  }, { passive: true });

  // Explore button action
  heroContainer.querySelector("#hero-explore-btn")?.addEventListener("click", () => {
    const current = INDIAN_STATE_CAPITALS[currentIndex];
    appState.setState({ searchQuery: current.city, activeTab: "destinations" });
    const target = document.getElementById("destinations-section");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });

  // Plan Itinerary Action
  heroContainer.querySelector("#hero-plan-trip-btn")?.addEventListener("click", () => {
    const current = INDIAN_STATE_CAPITALS[currentIndex];
    appState.setActiveTab("planner");
  });

  // =========================================================================
  // LOCATION-BASED MULTI-DESTINATION SEARCH & PICKER HANDLERS
  // =========================================================================
  const useLocBtn = heroContainer.querySelector("#hero-use-location-btn");
  const nearbyDropdown = heroContainer.querySelector("#nearby-dest-dropdown");
  const destInputContainer = heroContainer.querySelector("#search-dest-input-container");

  const closeNearbyDropdown = () => {
    if (nearbyDropdown) {
      nearbyDropdown.style.display = "none";
      nearbyDropdown.innerHTML = "";
    }
  };

  const renderActiveChip = (dest) => {
    if (!destInputContainer) return;
    destInputContainer.innerHTML = `
      <div class="nearby-active-chip" id="hero-nearby-active-chip">
        <span>📍 Near ${dest.name} (${dest.distanceKm} km away)</span>
        <button type="button" class="chip-clear-btn" id="hero-clear-nearby-chip-btn" title="Clear location filter">✕</button>
      </div>
    `;
    destInputContainer.querySelector("#hero-clear-nearby-chip-btn")?.addEventListener("click", () => {
      appState.clearNearbyDestinationFilter();
      destInputContainer.innerHTML = `
        <input 
          type="text" 
          id="search-dest-input" 
          class="search-field-input" 
          placeholder="e.g. Jaipur, Goa, Bengaluru..." 
          value=""
          autocomplete="off"
        />
      `;
      closeNearbyDropdown();
    });
  };

  const handleNearbySelection = (dest) => {
    appState.setSelectedNearbyDestination({ id: dest.id, name: dest.name, distanceKm: dest.distanceKm });
    renderActiveChip(dest);
    closeNearbyDropdown();
    // Scope search to this specific destination
    appState.setState({ searchQuery: dest.name, activeTab: "stays" });
  };

  const fetchAndShowNearby = async (lat, lng, radiusKm = 150) => {
    if (useLocBtn) {
      useLocBtn.classList.add("locating");
      const span = useLocBtn.querySelector("span");
      if (span) span.textContent = "Locating...";
    }

    const API_BASE = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";

    try {
      // Store purely in-memory session state
      appState.setUserLocation({ lat, lng });

      let destinations = [];
      try {
        const res = await fetch(`${API_BASE}/destinations/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
        if (res.ok) {
          const data = await res.json();
          destinations = data.data?.destinations || [];
        }
      } catch (networkErr) {
        console.warn("Backend nearby fetch failed, using client-side proximity fallback:", networkErr);
      }

      // If backend was offline or returned empty, compute local proximity
      if (destinations.length === 0) {
        destinations = DESTINATIONS.map(d => {
          const dLat = d.latitude || 12.9716;
          const dLng = d.longitude || 77.5946;
          const dist = Math.round(appState.calculateDistanceKm(lat, lng, dLat, dLng));
          return {
            id: d.id,
            name: d.name,
            state: d.state || d.country,
            landmark: d.topAttraction || d.landmarks?.[0]?.name || "",
            distanceKm: dist,
          };
        }).filter(d => d.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm);

        if (destinations.length === 0) {
          // If still none within radius, return top 3 closest
          destinations = DESTINATIONS.map(d => {
            const dLat = d.latitude || 12.9716;
            const dLng = d.longitude || 77.5946;
            const dist = Math.round(appState.calculateDistanceKm(lat, lng, dLat, dLng));
            return {
              id: d.id,
              name: d.name,
              state: d.state || d.country,
              landmark: d.topAttraction || d.landmarks?.[0]?.name || "",
              distanceKm: dist,
            };
          }).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
        }
      }

      appState.setNearbyDestinations(destinations);

      if (useLocBtn) {
        useLocBtn.classList.remove("locating");
        const span = useLocBtn.querySelector("span");
        if (span) span.textContent = "Use my location";
      }

      if (destinations.length === 1) {
        // Single destination found -> Auto-select directly, but show editable chip
        handleNearbySelection(destinations[0]);
        appState.showToast(`Auto-selected nearest destination: ${destinations[0].name} (${destinations[0].distanceKm} km)`);
      } else if (destinations.length > 1) {
        // Multiple destinations found -> Show dropdown list
        if (nearbyDropdown) {
          nearbyDropdown.innerHTML = `
            <div class="nearby-dest-dropdown-header">
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Nearby Destinations (${destinations.length} found)
              </span>
              <button type="button" class="nearby-dest-close-btn" id="close-nearby-dropdown-btn">✕</button>
            </div>
            <div class="nearby-dest-list">
              ${destinations.map(d => `
                <button type="button" class="nearby-dest-item" data-dest-id="${d.id}" data-dest-name="${d.name}" data-dest-dist="${d.distanceKm}">
                  <div class="dest-meta">
                    <div class="dest-name">
                      <span>🏰</span>
                      <span>${d.name}</span>
                    </div>
                    <div class="dest-sub">${d.landmark ? `Near ${d.landmark} • ` : ''}${d.state}</div>
                  </div>
                  <span class="nearby-distance-pill">${d.distanceKm} km</span>
                </button>
              `).join('')}
            </div>
          `;
          nearbyDropdown.style.display = "flex";

          nearbyDropdown.querySelector("#close-nearby-dropdown-btn")?.addEventListener("click", closeNearbyDropdown);

          nearbyDropdown.querySelectorAll(".nearby-dest-item").forEach(item => {
            item.addEventListener("click", () => {
              const d = {
                id: item.dataset.destId,
                name: item.dataset.destName,
                distanceKm: parseInt(item.dataset.destDist, 10),
              };
              handleNearbySelection(d);
            });
          });
        }
      } else {
        // Empty state within radius -> Offer graceful radius expansion
        if (nearbyDropdown) {
          nearbyDropdown.innerHTML = `
            <div class="nearby-dest-dropdown-header">
              <span>📍 No destinations within ${radiusKm} km</span>
              <button type="button" class="nearby-dest-close-btn" id="close-nearby-dropdown-btn">✕</button>
            </div>
            <div style="padding: 10px; text-align: center;">
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">Would you like to expand the search radius?</p>
              <button type="button" class="btn-primary-gold" id="expand-radius-btn" style="padding: 6px 14px; font-size: 0.76rem; width: 100%;">
                Expand to 350 km Radius
              </button>
            </div>
          `;
          nearbyDropdown.style.display = "flex";
          nearbyDropdown.querySelector("#close-nearby-dropdown-btn")?.addEventListener("click", closeNearbyDropdown);
          nearbyDropdown.querySelector("#expand-radius-btn")?.addEventListener("click", () => {
            fetchAndShowNearby(lat, lng, 350);
          });
        }
      }
    } catch (e) {
      console.warn("Nearby fetch failed:", e);
      if (useLocBtn) {
        useLocBtn.classList.remove("locating");
        const span = useLocBtn.querySelector("span");
        if (span) span.textContent = "Use my location";
      }
    }
  };


  useLocBtn?.addEventListener("click", () => {
    if (navigator.geolocation) {
      if (useLocBtn) {
        useLocBtn.classList.add("locating");
        const span = useLocBtn.querySelector("span");
        if (span) span.textContent = "Locating...";
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchAndShowNearby(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.log("Geolocation prompt denied/unavailable, fallback to Jaipur coords for demo:", err);
          appState.showToast("📍 Using current region coordinates (Jaipur)");
          fetchAndShowNearby(26.9124, 75.7873);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      fetchAndShowNearby(26.9124, 75.7873);
    }
  });

  // Clear chip listener if chip exists on initial render
  heroContainer.querySelector("#hero-clear-nearby-chip-btn")?.addEventListener("click", () => {
    appState.clearNearbyDestinationFilter();
    if (destInputContainer) {
      destInputContainer.innerHTML = `
        <input 
          type="text" 
          id="search-dest-input" 
          class="search-field-input" 
          placeholder="e.g. Jaipur, Goa, Bengaluru..." 
          value=""
          autocomplete="off"
        />
      `;
    }
    closeNearbyDropdown();
  });

  // AI Smart Launcher Clicks
  heroContainer.querySelector("#hero-photo-trip-btn")?.addEventListener("click", () => {
    appState.setActiveTab("ai_planner");
  });

  heroContainer.querySelector("#hero-budget-planner-btn")?.addEventListener("click", () => {
    appState.setActiveTab("planner");
    setTimeout(() => {
      document.getElementById("open-planner-generator-btn")?.click();
      document.getElementById("mode-btn-budget")?.click();
    }, 150);
  });

  heroContainer.querySelector("#hero-rebuild-trip-btn")?.addEventListener("click", () => {
    appState.setActiveTab("planner");
    setTimeout(() => {
      document.getElementById("open-rebuild-modal-btn")?.click();
    }, 150);
  });

  return heroContainer;
}
