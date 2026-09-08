// AURICVYOM Navbar Component with Connected Authentication Experience
import { appState } from "../state.js";

export function renderNavbar() {
  const nav = document.createElement("nav");
  nav.className = "auric-navbar";
  nav.id = "main-navbar";

  let isProfileDropdownOpen = false;

  const updateNavDOM = () => {
    const { activeTab, bookings, wishlist, currentUser, isAuthenticated } = appState.getState();

    const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Traveler';
    const userInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AV';
    const userAvatar = currentUser?.avatar || currentUser?.profileImage;

    nav.innerHTML = `
      <!-- Brand Logo & Identity -->
      <div class="brand-container" id="nav-brand-logo" title="AuricVyom — Luxury Bespoke Travel">
        <div class="brand-logo-mark">
          <span>AV</span>
        </div>
        <div class="brand-text-wrap">
          <div class="brand-title">Auric<span>Vyom</span></div>
          <div class="brand-tagline">Bespoke Indian Journeys</div>
        </div>
      </div>

      <!-- Desktop Nav Links -->
      <ul class="nav-links-menu">
        <li>
          <button class="nav-link-btn ${activeTab === 'flights' || activeTab === 'transport' ? 'active' : ''}" data-tab="flights">
            Flights
          </button>
        </li>
        <li>
          <button class="nav-link-btn ${activeTab === 'stays' ? 'active' : ''}" data-tab="stays">
            Hotels
          </button>
        </li>
        <li>
          <button class="nav-link-btn ${activeTab === 'packages' ? 'active' : ''}" data-tab="packages">
            Holidays
          </button>
        </li>
        <li>
          <button class="nav-link-btn ${activeTab === 'explore' || activeTab === 'destinations' ? 'active' : ''}" data-tab="explore">
            Explore India
          </button>
        </li>
        <li>
          <button class="nav-link-btn ${activeTab === 'planner' || activeTab === 'ai_planner' ? 'active' : ''}" data-tab="planner">
            AI Studio
          </button>
        </li>
        <li>
          <button class="nav-link-btn ${activeTab === 'bookings' || activeTab === 'saved' ? 'active' : ''}" data-tab="bookings">
            My Trips
          </button>
        </li>
        <li>
          <button class="nav-link-btn ${activeTab === 'collab' ? 'active' : ''}" data-tab="collab" style="color: var(--gold-light);">
            👥 VyomTogether
          </button>
        </li>
      </ul>

      <!-- Right Action Utilities -->
      <div class="nav-actions">
        <!-- Search Trigger -->
        <button class="action-icon-btn" id="nav-search-btn" title="Global Search (Ctrl+K)" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>

        <!-- Currency Switcher Selector -->
        <div class="currency-badge" title="Select Currency" style="display: flex; align-items: center; padding: 2px 8px; border: 1px solid var(--border-gold); border-radius: var(--radius-full); background: rgba(212,175,55,0.06);">
          <select id="nav-currency-select" aria-label="Select Currency" style="background: transparent; color: var(--gold-light); border: none; font-size: 0.8rem; font-weight: 700; cursor: pointer; outline: none; padding: 2px 4px;">
            <option value="INR" style="background: #080c14; color: #fff;" ${(appState.getState().currency || 'INR') === 'INR' ? 'selected' : ''}>₹ INR</option>
            <option value="USD" style="background: #080c14; color: #fff;" ${appState.getState().currency === 'USD' ? 'selected' : ''}>$ USD</option>
            <option value="EUR" style="background: #080c14; color: #fff;" ${appState.getState().currency === 'EUR' ? 'selected' : ''}>€ EUR</option>
            <option value="GBP" style="background: #080c14; color: #fff;" ${appState.getState().currency === 'GBP' ? 'selected' : ''}>£ GBP</option>
          </select>
        </div>

        <!-- Authenticated User Profile OR Login CTA -->
        ${isAuthenticated && currentUser ? `
          <div class="nav-user-profile-wrapper" id="nav-user-dropdown-container">
            <button class="user-profile-btn" id="nav-profile-btn" aria-expanded="${isProfileDropdownOpen}" aria-haspopup="true" title="Account Menu">
              ${userAvatar ? `
                <img src="${userAvatar}" alt="${currentUser.name}" class="user-avatar-img" />
              ` : `
                <div class="user-avatar-initials">${userInitials}</div>
              `}
              <span class="user-name-label">${firstName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="dropdown-chevron ${isProfileDropdownOpen ? 'open' : ''}">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Profile Interactive Dropdown Menu -->
            <div class="nav-profile-dropdown ${isProfileDropdownOpen ? 'active' : ''}" id="nav-profile-dropdown-menu">
              <div class="dropdown-header">
                <div class="dropdown-user-info">
                  <div class="dropdown-name">${currentUser.name}</div>
                  <div class="dropdown-email">${currentUser.email}</div>
                </div>
                <div class="dropdown-tier-badge">
                  <span>👑 ${currentUser.tier || 'Auric Member'}</span>
                </div>
                <div class="dropdown-points-row">
                  <span>Auric Loyalty Points:</span>
                  <strong class="gold-text">${(currentUser.loyaltyPoints || 14850).toLocaleString()} pts</strong>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <div class="dropdown-menu-items">
                <button class="dropdown-item-btn" data-action="profile">
                  <span class="item-icon">👤</span>
                  <span>My Profile & Dashboard</span>
                </button>
                <button class="dropdown-item-btn" data-action="collab">
                  <span class="dropdown-icon">👥</span>
                  <span>VyomTogether Journeys</span>
                </button>
                <button class="dropdown-item-btn" data-action="saved">
                  <span class="item-icon">❤️</span>
                  <span>Saved Trips & Wishlist</span>
                  <span class="dropdown-item-counter">${wishlist?.length || 0}</span>
                </button>
                <button class="dropdown-item-btn" data-action="journal">
                  <span class="item-icon">📖</span>
                  <span>Travel Journal & Gazette</span>
                </button>
                <button class="dropdown-item-btn" data-action="bookings">
                  <span class="item-icon">🎟️</span>
                  <span>My Bookings & Passes</span>
                  <span class="dropdown-item-counter">${bookings?.length || 0}</span>
                </button>
                <button class="dropdown-item-btn" data-action="preferences">
                  <span class="item-icon">⚙️</span>
                  <span>Traveler Preferences</span>
                </button>
                <button class="dropdown-item-btn" data-action="admin" style="background: rgba(212,175,55,0.08); border-radius: var(--radius-sm);">
                  <span class="item-icon">👑</span>
                  <span style="color: var(--gold-light); font-weight: 700;">Admin & Operations Console</span>
                </button>
              </div>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item-btn logout-btn" id="nav-dropdown-logout-btn">
                <span class="item-icon">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ` : `
          <div style="display: flex; gap: 10px; align-items: center;">
            <button class="btn-primary-gold" id="nav-login-btn" style="padding: 9px 20px; font-size: 0.85rem;">
              <span>Sign In</span>
            </button>
          </div>
        `}

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" id="mobile-menu-btn" aria-label="Toggle Navigation">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    // Attach listeners
    nav.querySelector("#nav-brand-logo")?.addEventListener("click", () => {
      appState.setActiveTab("home");
    });

    nav.querySelectorAll(".nav-link-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        appState.setActiveTab(btn.dataset.tab);
      });
    });

    nav.querySelector("#nav-search-btn")?.addEventListener("click", () => {
      appState.setState({ activeModal: "search" });
    });

    // Profile dropdown toggle
    const profileBtn = nav.querySelector("#nav-profile-btn");
    if (profileBtn) {
      profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isProfileDropdownOpen = !isProfileDropdownOpen;
        const menu = nav.querySelector("#nav-profile-dropdown-menu");
        const chevron = nav.querySelector(".dropdown-chevron");
        if (menu) menu.classList.toggle("active", isProfileDropdownOpen);
        if (chevron) chevron.classList.toggle("open", isProfileDropdownOpen);
      });
    }

    // Dropdown Actions
    nav.querySelectorAll(".dropdown-item-btn[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        isProfileDropdownOpen = false;
        const action = btn.dataset.action;
        if (action === "profile") appState.setActiveTab("dashboard");
        else if (action === "collab") appState.setActiveTab("collab");
        else if (action === "saved") appState.setActiveTab("saved");
        else if (action === "journal") appState.setActiveTab("journal");
        else if (action === "bookings") appState.setActiveTab("bookings");
        else if (action === "preferences") appState.setActiveTab("dashboard");
        else if (action === "admin") appState.setActiveTab("admin");
      });
    });

    // Logout
    nav.querySelector("#nav-dropdown-logout-btn")?.addEventListener("click", () => {
      isProfileDropdownOpen = false;
      appState.logout();
    });

    // Currency Switcher
    nav.querySelector("#nav-currency-select")?.addEventListener("change", (e) => {
      appState.setCurrency(e.target.value);
    });

    // Login trigger
    nav.querySelector("#nav-login-btn")?.addEventListener("click", () => {
      appState.openAuth("login");
    });

    // Mobile Menu
    nav.querySelector("#mobile-menu-btn")?.addEventListener("click", () => {
      const drawer = document.getElementById("mobile-drawer");
      const drawerBackdrop = document.getElementById("mobile-drawer-backdrop");
      const isOpen = drawer?.classList.contains("active");
      if (isOpen) {
        drawer?.classList.remove("active");
        drawerBackdrop?.classList.remove("active");
      } else {
        drawer?.classList.add("active");
        drawerBackdrop?.classList.add("active");
      }
    });
  };

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (isProfileDropdownOpen && !nav.contains(e.target)) {
      isProfileDropdownOpen = false;
      const menu = nav.querySelector("#nav-profile-dropdown-menu");
      const chevron = nav.querySelector(".dropdown-chevron");
      if (menu) menu.classList.remove("active");
      if (chevron) chevron.classList.remove("open");
    }
  });

  // Sticky header behavior on scroll (shrink/hide on scroll-down, show on scroll-up)
  let lastScrollY = window.scrollY || 0;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY || 0;
    if (currentScrollY > 60) {
      nav.classList.add("scrolled");
      if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 8) {
        nav.classList.add("nav-hidden");
      } else if (lastScrollY - currentScrollY > 8) {
        nav.classList.remove("nav-hidden");
      }
    } else {
      nav.classList.remove("scrolled");
      nav.classList.remove("nav-hidden");
    }
    lastScrollY = Math.max(0, currentScrollY);
  }, { passive: true });

  appState.subscribe(() => {
    updateNavDOM();
  });

  updateNavDOM();
  return nav;
}
