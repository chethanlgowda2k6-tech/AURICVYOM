// AURICVYOM Main Application Entry & Coordinator (Production Master Architecture)
import { appState } from "./state.js";
import { renderNavbar } from "./components/Navbar.js";
import { renderHero } from "./components/Hero.js";
import { renderExploreIndiaView } from "./components/ExploreIndiaView.js";
import { renderDestinationsView } from "./components/DestinationsView.js";
import { renderStaysView } from "./components/StaysView.js";
import { renderStayDetailModal } from "./components/StayDetailModal.js";
import { renderExperiencesView } from "./components/ExperiencesView.js";
import { renderExperienceDetailModal } from "./components/ExperienceDetailModal.js";
import { renderTransportView } from "./components/TransportView.js";
import { renderPackagesView } from "./components/PackagesView.js";
import { renderTripPlanner } from "./components/TripPlanner.js";
import { renderAIPlanner } from "./components/AIPlanner.js";
import { renderUserDashboardView } from "./components/UserDashboardView.js";
import { renderTravelJournalView } from "./components/TravelJournalView.js";
import { renderReviewsSection } from "./components/ReviewsSection.js";
import { renderPersonalizationSection } from "./components/PersonalizationSection.js";
import { renderMobileBottomNav } from "./components/MobileBottomNav.js";
import { renderSavedTripsView } from "./components/SavedTripsView.js";
import { renderMyBookingsView } from "./components/MyBookingsView.js";
import { renderDestinationModal } from "./components/DestinationModal.js";
import { renderBookingModal } from "./components/BookingModal.js";
import { renderAuthModal } from "./components/AuthModal.js";
import { renderAuthView } from "./components/AuthView.js";
import { renderGlobalSearchModal } from "./components/GlobalSearchModal.js";
import { renderAdminDashboardView } from "./components/AdminDashboardView.js";
import { renderNadiaFloatingWidget } from "./components/NadiaFloatingWidget.js";
import { renderTripCollabView } from "./components/TripCollabView.js";
import { renderFooter } from "./components/Footer.js";

class AuricVistaApp {
  constructor() {
    this.appRoot = document.getElementById("app-root");
    this.init();
  }

  init() {
    this.renderShell();
    this.bindEvents();

    // Check initial URL hash/path
    this.handleUrlRouting();

    let lastTab = null;
    appState.subscribe((state) => {
      if (state.activeTab !== lastTab) {
        lastTab = state.activeTab;
        this.renderMainContent(state.activeTab);
        this.updateBrowserUrl(state.activeTab);
      }
      this.renderToast(state.toastMessage);
      this.updateMobileDrawer(state);
    });

    this.renderMainContent(appState.getState().activeTab);
  }

  handleUrlRouting() {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    
    if (hash === "login") {
      appState.openAuth("login");
    } else if (hash === "signup" || hash === "register") {
      appState.openAuth("signup");
    } else if (hash === "forgot-password" || hash === "forgot") {
      appState.openAuth("forgot");
    } else if (hash === "reset-password" || hash === "reset") {
      appState.openAuth("reset");
    } else if (hash === "personalization") {
      appState.openAuth("personalization");
    } else if (hash && ["home", "explore", "destinations", "stays", "experiences", "transport", "flights", "packages", "planner", "journal", "dashboard", "ai_planner", "saved", "bookings", "collab", "collaborate", "team_trips"].includes(hash)) {
      appState.setActiveTab(hash);
    }
  }

  updateBrowserUrl(activeTab) {
    if (activeTab === "home") {
      if (window.location.hash && !["#login", "#signup", "#forgot-password", "#reset-password", "#personalization"].includes(window.location.hash)) {
        history.replaceState(null, "", window.location.pathname);
      }
    }
  }

  renderShell() {
    this.appRoot.innerHTML = `
      <!-- Sticky Glass Navbar Container -->
      <div id="navbar-mount"></div>

      <!-- Main Dynamic Content Container -->
      <main class="app-main-content" id="main-content-mount"></main>

      <!-- Footer Mount -->
      <div id="footer-mount"></div>

      <!-- Mobile Sticky Bottom Dock Navigation -->
      <div id="mobile-bottom-mount"></div>

      <!-- Modals Mount -->
      <div id="modals-mount"></div>

      <!-- Toast Notification Mount -->
      <div id="toast-mount" style="position: fixed; bottom: 85px; right: 24px; z-index: 9999; pointer-events: none;"></div>

      <!-- Mobile Navigation Drawer & Backdrop -->
      <div class="mobile-drawer-backdrop" id="mobile-drawer-backdrop"></div>
      <div class="mobile-drawer" id="mobile-drawer">
        <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
          <div class="brand-title" style="font-size: 1.2rem;">Auric<span>Vyom</span></div>
          <button id="close-drawer-btn" style="color: var(--text-white); font-size: 1.4rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 50%; background: rgba(255,255,255,0.06);" aria-label="Close Drawer">✕</button>
        </div>
        <div id="mobile-drawer-auth-badge" style="padding: 16px 24px; border-bottom: 1px solid var(--border-subtle);"></div>
        <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 14px;">
          <button class="nav-link-btn" data-nav="home" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">Home</button>
          <button class="nav-link-btn" data-nav="flights" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">Flights</button>
          <button class="nav-link-btn" data-nav="stays" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">Hotels & Stays</button>
          <button class="nav-link-btn" data-nav="packages" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">Holidays</button>
          <button class="nav-link-btn" data-nav="explore" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">Explore India</button>
          <button class="nav-link-btn" data-nav="bookings" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">My Trips</button>
          <button class="nav-link-btn" data-nav="collab" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center; color: var(--gold-light);">👥 Collaborative Trips</button>
          <button class="nav-link-btn" data-nav="planner" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">Trip Planner Studio</button>
          <button class="nav-link-btn" data-nav="dashboard" style="text-align: left; font-size: 1.05rem; min-height: 44px; display: flex; align-items: center;">My Dashboard</button>
          <div id="mobile-drawer-auth-btn-wrap" style="margin-top: 8px;"></div>
        </div>
      </div>
    `;

    // Mount Navbar & Footer & Mobile Dock
    document.getElementById("navbar-mount").appendChild(renderNavbar());
    document.getElementById("footer-mount").appendChild(renderFooter());
    document.getElementById("mobile-bottom-mount").appendChild(renderMobileBottomNav());

    // Mount Modals & Floating Widgets
    const modalsMount = document.getElementById("modals-mount");
    modalsMount.appendChild(renderDestinationModal());
    modalsMount.appendChild(renderStayDetailModal());
    modalsMount.appendChild(renderExperienceDetailModal());
    modalsMount.appendChild(renderBookingModal());
    modalsMount.appendChild(renderAuthModal());
    modalsMount.appendChild(renderGlobalSearchModal());
    document.body.appendChild(renderNadiaFloatingWidget());

    // Mobile drawer listeners
    const drawer = document.getElementById("mobile-drawer");
    const drawerBackdrop = document.getElementById("mobile-drawer-backdrop");

    const closeDrawer = () => {
      drawer?.classList.remove("active");
      drawerBackdrop?.classList.remove("active");
    };

    document.getElementById("close-drawer-btn")?.addEventListener("click", closeDrawer);
    drawerBackdrop?.addEventListener("click", closeDrawer);

    drawer.querySelectorAll("[data-nav]").forEach(btn => {
      btn.addEventListener("click", () => {
        appState.setActiveTab(btn.dataset.nav);
        closeDrawer();
      });
    });

    this.updateMobileDrawer(appState.getState());
  }

  updateMobileDrawer(state) {
    const badgeWrap = document.getElementById("mobile-drawer-auth-badge");
    const btnWrap = document.getElementById("mobile-drawer-auth-btn-wrap");
    const drawer = document.getElementById("mobile-drawer");

    if (badgeWrap && btnWrap) {
      if (state.isAuthenticated && state.currentUser) {
        badgeWrap.innerHTML = `
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${state.currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" style="width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid var(--gold-primary); object-fit: cover;" />
            <div>
              <div style="font-weight: 700; color: var(--text-white); font-size: 0.95rem;">${state.currentUser.name}</div>
              <div style="font-size: 0.75rem; color: var(--gold-light);">👑 ${(state.currentUser.loyaltyPoints || 14850).toLocaleString()} Auric pts</div>
            </div>
          </div>
        `;
        btnWrap.innerHTML = `
          <button class="btn-outline-glass" id="mobile-drawer-logout-btn" style="width: 100%; justify-content: center; color: #f43f5e; border-color: rgba(244,63,94,0.3); padding: 10px;">
            Sign Out
          </button>
        `;
        document.getElementById("mobile-drawer-logout-btn")?.addEventListener("click", () => {
          drawer.classList.remove("active");
          appState.logout();
        });
      } else {
        badgeWrap.innerHTML = `
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            Sign in to unlock bespoke journeys and diamond rewards.
          </div>
        `;
        btnWrap.innerHTML = `
          <button class="btn-primary-gold" id="mobile-drawer-login-btn" style="width: 100%; justify-content: center; padding: 10px;">
            Sign In / Register
          </button>
        `;
        document.getElementById("mobile-drawer-login-btn")?.addEventListener("click", () => {
          drawer.classList.remove("active");
          appState.openAuth("login");
        });
      }
    }
  }

  renderToast(msg) {
    const toastMount = document.getElementById("toast-mount");
    if (!toastMount) return;
    if (!msg) {
      toastMount.innerHTML = "";
      return;
    }
    toastMount.innerHTML = `
      <div style="background: rgba(13, 21, 36, 0.96); border: 1px solid var(--border-gold); border-radius: var(--radius-full); padding: 12px 24px; color: var(--gold-light); font-weight: 700; font-size: 0.92rem; box-shadow: var(--shadow-lg); backdrop-filter: blur(14px); animation: fadeIn 0.3s ease;">
        ${msg}
      </div>
    `;
  }

  renderMainContent(activeTab) {
    const mainMount = document.getElementById("main-content-mount");
    mainMount.innerHTML = "";

    if (activeTab === "home") {
      // 1. FULL-SCREEN AURICVYOM AUTOMATIC INDIAN CITIES HERO CAROUSEL & TRAVEL SEARCH
      mainMount.appendChild(renderHero());

      // 2. Dynamic Personalization (Recommended for you, Because you liked...)
      mainMount.appendChild(renderPersonalizationSection());

      // 3. Explore Karnataka & Trending India & Weekend Getaways & Hidden Gems (Explore India Hub)
      mainMount.appendChild(renderExploreIndiaView());

      // 4. Popular Stays
      mainMount.appendChild(renderStaysView());

      // 5. Unique Experiences
      mainMount.appendChild(renderExperiencesView());

      // 6. Travel Packages
      mainMount.appendChild(renderPackagesView());

      // 7. Multi-Modal Transport (Flights, Trains, Buses, Cabs)
      mainMount.appendChild(renderTransportView());

      // 8. AI Trip Planner Preview & Companion
      mainMount.appendChild(renderAIPlanner());

      // 9. Travel Stories & Gazette
      mainMount.appendChild(renderTravelJournalView());

      // 10. Verified Traveler Reviews
      mainMount.appendChild(renderReviewsSection());

      // 11. Final "Plan Your Journey" Hero CTA Banner
      const finalCta = document.createElement("section");
      finalCta.className = "section-spacing";
      finalCta.innerHTML = `
        <div class="content-container">
          <div style="background: linear-gradient(135deg, rgba(18,27,43,0.95), rgba(7,9,14,0.98)), url('https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1400&q=80') center/cover; border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 80px 48px; text-align: center; box-shadow: var(--shadow-lg); position: relative; overflow: hidden;">
            <div style="max-width: 780px; margin: 0 auto; position: relative; z-index: 2;">
              <span class="section-tag-gold" style="font-size: 0.9rem;">✨ YOUR JOURNEY AWAITS</span>
              <h2 style="font-family: var(--font-serif); font-size: clamp(2.4rem, 4.5vw, 3.8rem); color: var(--text-white); margin-bottom: 16px; line-height: 1.15;">
                Craft Your Masterpiece Escape with AuricVyom
              </h2>
              <p style="color: var(--text-secondary); font-size: 1.15rem; line-height: 1.7; margin-bottom: 32px;">
                Experience India’s finest state capitals, heritage sanctuaries, misty coffee highlands, and private safaris with an intelligent companion.
              </p>
              <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary-gold" onclick="appState.setActiveTab('planner')" style="padding: 16px 36px; font-size: 1rem;">
                  ✨ Plan My Trip in Studio
                </button>
                <button class="btn-outline-glass" onclick="appState.setActiveTab('stays')" style="padding: 16px 32px; font-size: 1rem;">
                  🏨 Explore Luxury Stays
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      mainMount.appendChild(finalCta);

    } else if (activeTab === "explore") {
      mainMount.appendChild(renderExploreIndiaView());
    } else if (activeTab === "destinations") {
      mainMount.appendChild(renderDestinationsView());
    } else if (activeTab === "stays") {
      mainMount.appendChild(renderStaysView());
    } else if (activeTab === "experiences") {
      mainMount.appendChild(renderExperiencesView());
    } else if (activeTab === "transport" || activeTab === "flights") {
      mainMount.appendChild(renderTransportView());
    } else if (activeTab === "packages") {
      mainMount.appendChild(renderPackagesView());
    } else if (activeTab === "planner") {
      mainMount.appendChild(renderTripPlanner());
    } else if (activeTab === "journal") {
      mainMount.appendChild(renderTravelJournalView());
    } else if (activeTab === "dashboard") {
      mainMount.appendChild(renderUserDashboardView());
    } else if (activeTab === "ai_planner") {
      mainMount.appendChild(renderAIPlanner());
    } else if (activeTab === "saved") {
      mainMount.appendChild(renderSavedTripsView());
    } else if (activeTab === "bookings") {
      mainMount.appendChild(renderMyBookingsView());
    } else if (activeTab === "collab" || activeTab === "collaborate" || activeTab === "team_trips") {
      mainMount.appendChild(renderTripCollabView());
    } else if (activeTab === "admin") {
      mainMount.appendChild(renderAdminDashboardView());
    }
  }

  bindEvents() {
    window.addEventListener("error", (e) => {
      console.warn("AuricVyom runtime notice", e);
    });

    window.addEventListener("popstate", () => {
      this.handleUrlRouting();
    });

    window.addEventListener("hashchange", () => {
      this.handleUrlRouting();
    });
  }
}

function startApp() {
  new AuricVistaApp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
