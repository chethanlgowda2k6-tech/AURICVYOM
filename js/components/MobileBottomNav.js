// AURICVYOM Mobile Sticky Bottom Navigation Bar (Native App Polish)
import { appState } from "../state.js";

export function renderMobileBottomNav() {
  const nav = document.createElement("div");
  nav.className = "mobile-bottom-nav";
  nav.id = "mobile-bottom-dock";

  const updateNav = () => {
    const { activeTab, wishlist, bookings } = appState.getState();

    nav.innerHTML = `
      <button class="mobile-dock-item ${activeTab === 'home' || activeTab === 'explore' || activeTab === 'destinations' ? 'active' : ''}" data-nav="home">
        <div class="dock-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span>Explore</span>
      </button>

      <button class="mobile-dock-item ${activeTab === 'flights' || activeTab === 'transport' ? 'active' : ''}" data-nav="flights">
        <div class="dock-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M22 2L11 13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </div>
        <span>Flights</span>
      </button>

      <button class="mobile-dock-item ${activeTab === 'stays' ? 'active' : ''}" data-nav="stays">
        <div class="dock-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 21h18M3 7v14M21 7v14M6 3h12a3 3 0 0 1 3 3v1H3V6a3 3 0 0 1 3-3z"/>
            <line x1="9" y1="11" x2="9" y2="15"/>
            <line x1="15" y1="11" x2="15" y2="15"/>
          </svg>
        </div>
        <span>Hotels</span>
      </button>

      <button class="mobile-dock-item ${activeTab === 'planner' || activeTab === 'ai_planner' ? 'active' : ''}" data-nav="planner">
        <div class="dock-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
        </div>
        <span>Planner</span>
      </button>

      <button class="mobile-dock-item ${activeTab === 'bookings' || activeTab === 'saved' || activeTab === 'dashboard' ? 'active' : ''}" data-nav="bookings">
        <div class="dock-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${wishlist.length + bookings.length > 0 ? `<span class="mobile-badge-counter">${wishlist.length + bookings.length}</span>` : ''}
        </div>
        <span>My Trips</span>
      </button>
    `;

    nav.querySelectorAll("[data-nav]").forEach(btn => {
      btn.addEventListener("click", () => {
        appState.setActiveTab(btn.dataset.nav);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  };

  appState.subscribe(() => {
    updateNav();
  });

  updateNav();
  return nav;
}
