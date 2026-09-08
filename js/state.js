// AURICVYOM State Management & Reactive Store (Production Master Edition)
import { generateIntelligentItinerary } from "./services/itineraryGenerator.js";
import { TRAVEL_STORIES } from "./data/stories.js";
import { REVIEWS } from "./data/reviews.js";
import { authService } from "./services/authService.js";

class StateManager {
  constructor() {
    this.subscribers = new Map();

    const defaultTrip = generateIntelligentItinerary({
      from: "Bangalore",
      destinationId: "coorg",
      daysCount: 3,
      travellersCount: 2,
      budget: 15000,
      travelStyle: "Couple",
      interests: ["Nature", "Food"],
      pace: "Balanced"
    });

    const savedWishlist = this.loadFromStorage("auricvista_wishlist", [
      {
        id: "coorg",
        name: "Coorg (Kodagu)",
        type: "destination",
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
        country: "India",
        state: "Karnataka",
        rating: 4.96,
        startingPrice: "₹4,999"
      },
      {
        id: "stay-tamara-coorg",
        name: "The Tamara Coorg — Luxury Rainforest Villa",
        type: "stay",
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
        country: "India",
        state: "Karnataka",
        rating: 4.96,
        startingPrice: "₹24,500"
      },
      {
        id: "exp-coorg-coffee",
        name: "Artisanal Coffee Cupping & Bean-to-Cup Safari",
        type: "experience",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        country: "India",
        state: "Karnataka",
        rating: 4.98,
        startingPrice: "₹3,499"
      }
    ]);

    const savedSearchHistory = this.loadFromStorage("auricvista_search_history", [
      "Coorg Coffee Estates",
      "Hampi Boulder Ruins",
      "Kabini Wildlife Safari",
      "Gokarna Om Beach"
    ]);

    const savedBookings = this.loadFromStorage("auricvista_bookings", [
      {
        id: "BK-82910",
        type: "stay",
        title: "The Tamara Coorg — Luxury Rainforest Villa",
        destination: "Coorg (Kodagu)",
        checkIn: "2026-09-15",
        checkOut: "2026-09-18",
        guests: 2,
        totalPrice: 73500,
        currency: "INR",
        status: "Confirmed",
        bookingDate: "2026-08-30",
        voucherCode: "AV-CRG-82910",
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80"
      }
    ]);

    const savedActiveTripPlan = this.loadFromStorage("auricvista_active_trip_plan", defaultTrip);
    const savedTripList = this.loadFromStorage("auricvista_saved_trips_list", [defaultTrip]);
    const savedStories = this.loadFromStorage("auricvista_user_stories", TRAVEL_STORIES);
    const savedReviews = this.loadFromStorage("auricvista_user_reviews", REVIEWS);

    // Initial auth restoration from authService
    const storedUser = authService.getStoredUser();
    const isAuth = authService.isAuthenticated();

    const fallbackUser = {
      name: "Chethan Gowda",
      email: "chethan@auricvista.com",
      phone: "+91 98801 23456",
      tier: "Auric Diamond Member",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      loyaltyPoints: 14850,
      tripsCompleted: 6,
      preferences: {
        currency: "INR",
        travelStyle: "Luxury & Nature",
        dietary: "Vegetarian / Gourmet",
        homeAirport: "BLR Kempegowda Bengaluru"
      }
    };

    const savedPaymentMethods = this.loadFromStorage("auricvista_saved_payments", {
      upi: ["chethan@okhdfcbank", "aurictravel@paytm"],
      cards: [{ last4: "4829", brand: "Visa Signature", expiry: "08/29" }]
    });

    const savedRecentlyViewed = this.loadFromStorage("auricvista_recently_viewed", [
      { id: "coorg", name: "Coorg (Kodagu)", type: "destination", image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80" },
      { id: "hampi", name: "Hampi & Vijayanagara", type: "destination", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" }
    ]);

    // Collaborative Trips Restoration
    const savedActiveCollabTrip = this.loadFromStorage("auricvyom_cached_collab_trip", null);
    const savedCollabTrips = this.loadFromStorage("auricvyom_cached_collab_trips", []);
    const savedActiveTab = this.loadFromStorage("auricvyom_active_tab", "home");
    const hash = typeof window !== "undefined" && window.location.hash ? window.location.hash.replace("#", "").toLowerCase() : null;
    const initialTab = (hash && ["home", "explore", "destinations", "stays", "experiences", "transport", "flights", "packages", "planner", "journal", "dashboard", "ai_planner", "saved", "bookings", "collab", "collaborate", "team_trips"].includes(hash))
      ? ((hash === "collaborate" || hash === "team_trips") ? "collab" : hash)
      : (savedActiveCollabTrip ? "collab" : (savedActiveTab || "home"));

    this.state = {
      activeTab: initialTab, // home, explore, destinations, stays, experiences, transport, flights, packages, planner, ai_planner, saved, bookings, dashboard, journal, login, signup, forgot_password, reset_password, personalization
      searchQuery: "",
      searchHistory: savedSearchHistory,
      selectedDestination: null,
      selectedStayDetail: null,
      selectedExperienceDetail: null,
      selectedStayForBooking: null,
      selectedExperienceForBooking: null,
      selectedPackageForBooking: null,
      selectedFlightForBooking: null,
      activeModal: null, // 'destination', 'stayDetail', 'experienceDetail', 'booking', 'search', 'filterDrawer', 'authModal', 'storyModal', 'reviewModal'
      
      // Centralized Auth State
      isAuthenticated: isAuth || (storedUser !== null),
      currentUser: storedUser || (isAuth ? fallbackUser : null),
      authMode: "login", // 'login', 'signup', 'forgot', 'reset', 'personalization'
      authLoading: false,
      authError: null,
      intendedRoute: null,
      intendedAction: null,

      savedPaymentMethods,
      recentlyViewed: savedRecentlyViewed,

      // Stories & Reviews
      travelStories: savedStories,
      reviews: savedReviews,

      // Collaborative Trips State
      collabTrips: savedCollabTrips,
      currentCollabTrip: savedActiveCollabTrip,
      collabSettlement: null,
      collabLoading: false,
      activeCollabWorkspaceTab: 'itinerary', // 'itinerary', 'places', 'polls', 'expenses', 'chat'

      // Discovery Filters
      filterRegion: "all",
      exploreCategory: "trending",
      budgetRange: "all",
      durationFilter: "all",
      travelTypeFilter: "all",
      selectedInterests: [],
      minRating: 0,
      maxDistance: 0,
      sortBy: "recommended",

      // Trip Planning State
      activeTripPlan: savedActiveTripPlan,
      savedTripPlans: savedTripList,

      wishlist: savedWishlist,
      bookings: savedBookings,
      currency: "INR",
      currencySymbol: "₹",
      currencyRate: 1,
      toastMessage: null,

      // Pure Session-Based Nearby Location Search State (No localStorage persistence)
      userLocation: null, // { lat: number, lng: number, name?: string }
      nearbyDestinations: [], // Array<{ id, name, state, landmark, distanceKm, distanceText }>
      selectedNearbyDestination: null, // { id, name, distanceKm }
      isNearbySearchActive: false,

      aiMessages: [
        {
          sender: "ai",
          text: "Namaste! I am **AuricVyom AI**, your personal luxury travel companion for India. I am synced with your active trip plan: **" + (savedActiveTripPlan ? savedActiveTripPlan.title : "Custom Escape") + "**. How can I refine your journey across India's 28 state capitals?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            "Plan a 5-day Golden Triangle trip",
            "Explore royal palaces in Jaipur & Udaipur",
            "Best coastal retreats in Goa & Kerala",
            "Recommend hidden scenic spots across India"
          ]
        }
      ]
    };

    // Asynchronously refresh user session in background
    if (this.state.isAuthenticated) {
      this.syncUserSession();
    }

    // Restore collaborative trip live details and SSE in background
    if (savedActiveCollabTrip?.id) {
      setTimeout(() => {
        this.fetchCollabTripDetails(savedActiveCollabTrip.id);
      }, 50);
    }
  }

  async syncUserSession() {
    try {
      const user = await authService.getMe();
      if (user) {
        this.setState({
          currentUser: {
            ...this.state.currentUser,
            ...user,
            tier: user.tier || this.state.currentUser?.tier || "Auric Diamond Member",
            loyaltyPoints: user.loyaltyPoints || this.state.currentUser?.loyaltyPoints || 14850,
            avatar: user.profileImage || this.state.currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
          },
          isAuthenticated: true
        });
      }
    } catch (e) {
      console.warn("Session sync notice:", e);
    }
  }

  loadFromStorage(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };

    if (updates.wishlist !== undefined) this.saveToStorage("auricvista_wishlist", this.state.wishlist);
    if (updates.bookings !== undefined) this.saveToStorage("auricvista_bookings", this.state.bookings);
    if (updates.activeTripPlan !== undefined) this.saveToStorage("auricvista_active_trip_plan", this.state.activeTripPlan);
    if (updates.savedTripPlans !== undefined) this.saveToStorage("auricvista_saved_trips_list", this.state.savedTripPlans);
    if (updates.travelStories !== undefined) this.saveToStorage("auricvista_user_stories", this.state.travelStories);
    if (updates.reviews !== undefined) this.saveToStorage("auricvista_user_reviews", this.state.reviews);
    if (updates.savedPaymentMethods !== undefined) this.saveToStorage("auricvista_saved_payments", this.state.savedPaymentMethods);
    if (updates.recentlyViewed !== undefined) this.saveToStorage("auricvista_recently_viewed", this.state.recentlyViewed);
    if (updates.searchHistory !== undefined) this.saveToStorage("auricvista_search_history", this.state.searchHistory);

    this.notify();
  }

  subscribe(callback) {
    const id = Symbol();
    this.subscribers.set(id, callback);
    return () => this.subscribers.delete(id);
  }

  notify() {
    for (const callback of this.subscribers.values()) {
      try {
        callback(this.state);
      } catch (err) {
        console.error("Subscriber error", err);
      }
    }
  }

  setActiveTab(tabId) {
    // Route guard check for protected views
    const protectedTabs = ["dashboard", "saved", "bookings", "journal"];
    if (protectedTabs.includes(tabId) && !this.state.isAuthenticated) {
      this.requireAuth(tabId, () => {
        this.saveToStorage("auricvyom_active_tab", tabId);
        this.setState({ activeTab: tabId, activeModal: null });
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }

    this.saveToStorage("auricvyom_active_tab", tabId);
    this.setState({ activeTab: tabId, activeModal: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  openDestinationModal(destination) {
    this.recordRecentlyViewed(destination);
    this.setState({ selectedDestination: destination, activeModal: "destination" });
  }

  openStayDetail(stay) {
    this.recordRecentlyViewed(stay);
    this.setState({
      selectedStayDetail: stay,
      selectedStayForModal: stay,
      activeModal: "stayDetail"
    });
  }

  openExperienceDetail(experience) {
    this.recordRecentlyViewed(experience);
    this.setState({
      selectedExperienceDetail: experience,
      activeModal: "experienceDetail"
    });
  }

  openBooking(item, type = "stay") {
    this.setState({
      selectedStayForBooking: type === "stay" ? item : null,
      selectedExperienceForBooking: type === "experience" ? item : null,
      selectedPackageForBooking: type === "package" ? item : null,
      selectedFlightForBooking: type === "flight" ? item : null,
      activeModal: "booking"
    });
  }

  openBookingModal(item, type = "stay") {
    return this.openBooking(item, type);
  }

  closeModal() {
    this.setState({ activeModal: null });
    if (["#login", "#signup", "#register", "#forgot-password", "#reset-password", "#personalization"].includes(window.location.hash)) {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  showToast(msg) {
    this.setState({ toastMessage: msg });
    setTimeout(() => {
      if (this.state.toastMessage === msg) {
        this.setState({ toastMessage: null });
      }
    }, 3200);
  }

  setCurrency(currencyCode) {
    const rates = {
      INR: { symbol: "₹", rate: 1, name: "INR (₹)" },
      USD: { symbol: "$", rate: 0.0116, name: "USD ($)" },
      EUR: { symbol: "€", rate: 0.0107, name: "EUR (€)" },
      GBP: { symbol: "£", rate: 0.0091, name: "GBP (£)" }
    };

    const sel = rates[currencyCode] || rates.INR;
    this.setState({
      currency: currencyCode,
      currencySymbol: sel.symbol,
      currencyRate: sel.rate
    });
    this.saveToStorage("auricvista_currency", currencyCode);
    this.showToast(`💱 Currency converted to ${sel.name}`);
  }

  formatPrice(amountInINR) {
    if (!amountInINR || isNaN(amountInINR)) return "₹0";
    const { currencySymbol, currencyRate } = this.state;
    const converted = Math.round(amountInINR * (currencyRate || 1));
    return `${currencySymbol || "₹"}${converted.toLocaleString("en-IN")}`;
  }

  toggleWishlistAlert(itemId, alertType = "price") {
    const updated = this.state.wishlist.map(item => {
      if (item.id === itemId) {
        if (alertType === "price") {
          const newVal = !item.priceAlert;
          this.showToast(newVal ? `🔔 Price drop alerts enabled for ${item.name || 'stay'}.` : `🔕 Price alerts muted for ${item.name || 'stay'}.`);
          return { ...item, priceAlert: newVal };
        } else if (alertType === "availability") {
          const newVal = !item.availabilityAlert;
          this.showToast(newVal ? `📅 Availability alerts enabled for ${item.name || 'stay'}.` : `🔕 Availability alerts muted.`);
          return { ...item, availabilityAlert: newVal };
        }
      }
      return item;
    });
    this.setState({ wishlist: updated });
    this.saveToStorage("auricvista_wishlist", updated);
  }

  recordRecentlyViewed(item) {
    if (!item || !item.id) return;
    const current = this.state.recentlyViewed.filter(x => x.id !== item.id);
    const updated = [{ id: item.id, name: item.name || item.title, type: item.pricePerNight ? "stay" : item.duration ? "experience" : "destination", image: item.image }, ...current].slice(0, 6);
    this.setState({ recentlyViewed: updated });
  }

  // --- AUTHENTICATION & SECURITY METHODS ---

  openAuth(mode = "login", intendedRoute = null, intendedAction = null) {
    this.setState({
      authMode: mode,
      intendedRoute: intendedRoute || this.state.intendedRoute,
      intendedAction: intendedAction || this.state.intendedAction,
      activeModal: "authModal",
      authError: null
    });
  }

  requireAuth(tabOrAction, callback) {
    if (this.state.isAuthenticated) {
      if (typeof callback === "function") callback();
      return true;
    }

    let intendedRoute = null;
    let intendedAction = null;

    if (typeof tabOrAction === "string") {
      intendedRoute = tabOrAction;
    } else if (typeof tabOrAction === "function") {
      intendedAction = tabOrAction;
    }

    this.showToast("🔒 Please sign in to access this feature.");
    this.openAuth("login", intendedRoute, intendedAction || callback);
    return false;
  }

  async login(email, password) {
    this.setState({ authLoading: true, authError: null });

    try {
      const result = await authService.login({ email, password });
      const user = result.user;

      const userObject = {
        id: user.id,
        name: user.name || "Noble Traveler",
        email: user.email,
        phone: user.phone || "+91 98801 23456",
        role: user.role || "USER",
        tier: user.tier || "Auric Diamond Member",
        avatar: user.avatar || user.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        loyaltyPoints: user.loyaltyPoints || 14850,
        tripsCompleted: user.tripsCompleted || 6,
        preferences: user.preferences || {
          currency: "INR",
          travelStyle: "Luxury & Nature",
          dietary: "Vegetarian / Gourmet",
          homeAirport: "BLR Kempegowda Bengaluru"
        }
      };

      const resumeRoute = this.state.intendedRoute || (this.state.activeTab === "login" || this.state.activeTab === "signup" ? "dashboard" : this.state.activeTab);
      const resumeAction = this.state.intendedAction;

      this.setState({
        isAuthenticated: true,
        currentUser: userObject,
        authLoading: false,
        authError: null,
        activeModal: null,
        intendedRoute: null,
        intendedAction: null,
        activeTab: resumeRoute
      });

      this.showToast(`✨ Welcome back, ${userObject.name.split(' ')[0]}!`);

      if (typeof resumeAction === "function") {
        setTimeout(() => resumeAction(), 200);
      }
      return { success: true };
    } catch (err) {
      this.setState({
        authLoading: false,
        authError: err.message || "We couldn't sign you in. Please check your email and password."
      });
      return { success: false, error: err.message };
    }
  }

  async signup(name, email, password, phone) {
    this.setState({ authLoading: true, authError: null });

    try {
      const result = await authService.register({ name, email, password, phone });
      const user = result.user;

      const userObject = {
        id: user.id,
        name: user.name || name || "Noble Traveler",
        email: user.email || email,
        phone: user.phone || phone || "+91 98765 43210",
        role: user.role || "USER",
        tier: "Auric Society Member",
        avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        loyaltyPoints: 1000,
        tripsCompleted: 0,
        preferences: user.preferences || {
          currency: "INR",
          travelStyle: "Luxury & Curated",
          dietary: "Gourmet",
          homeAirport: "BLR Kempegowda Bengaluru"
        }
      };

      this.setState({
        isAuthenticated: true,
        currentUser: userObject,
        authLoading: false,
        authError: null,
        authMode: "personalization" // Transition to lightweight personalization
      });

      this.showToast(`🎉 Welcome to AuricVyom, ${userObject.name.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      this.setState({
        authLoading: false,
        authError: err.message || "Unable to create account. Please try again."
      });
      return { success: false, error: err.message };
    }
  }

  async logout() {
    await authService.logout();
    localStorage.removeItem("auricvyom_cached_collab_trip");
    localStorage.removeItem("auricvyom_active_collab_trip_id");
    this.closeCollabSSE();
    this.setState({
      isAuthenticated: false,
      currentUser: null,
      currentCollabTrip: null,
      activeModal: null,
      activeTab: "home"
    });
    this.showToast("Logged out successfully.");
  }

  async updatePreferences(prefData) {
    await authService.updatePreferences(prefData);
    if (this.state.currentUser) {
      const updatedUser = {
        ...this.state.currentUser,
        preferences: {
          ...this.state.currentUser.preferences,
          ...prefData
        }
      };
      this.setState({
        currentUser: updatedUser,
        activeModal: null,
        activeTab: this.state.intendedRoute || "dashboard"
      });
      this.showToast("✨ Travel preferences tailored to your profile!");
    }
  }

  updateProfile(profileData) {
    if (!this.state.currentUser) return;
    const updated = { ...this.state.currentUser, ...profileData };
    this.setState({ currentUser: updated });
    authService.updatePreferences(profileData);
    this.showToast("Profile & preferences updated!");
  }

  addTravelStory(story) {
    this.requireAuth(() => {
      const newStory = {
        id: "story-" + Date.now(),
        author: this.state.currentUser.name,
        authorAvatar: this.state.currentUser.avatar,
        authorTier: this.state.currentUser.tier,
        readingTime: "3 min read",
        tripDates: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        ...story
      };
      const updated = [newStory, ...this.state.travelStories];
      this.setState({ travelStories: updated, activeModal: null });
      this.showToast("📖 Travel Story published to journal!");
    });
  }

  addReview(reviewData) {
    this.requireAuth(() => {
      const newReview = {
        id: "rev-" + Date.now(),
        author: this.state.currentUser.name,
        avatar: this.state.currentUser.avatar,
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        verifiedBooking: true,
        ...reviewData
      };
      const updated = [newReview, ...this.state.reviews];
      this.setState({ reviews: updated, activeModal: null });
      this.showToast("⭐ Verified Review published!");
    });
  }

  // --- TRIP PLANNER MUTATIONS ---
  generateNewTrip(params) {
    const newPlan = generateIntelligentItinerary(params);
    this.setState({
      activeTripPlan: newPlan,
      activeTab: "planner",
      activeModal: null
    });
    this.showToast(`✨ Generated ${newPlan.title}!`);
  }

  createNewTripPlan(params) {
    this.generateNewTrip(params);
  }


  recalculateBudget(trip) {
    let transportTotal = 0;
    let foodTotal = 0;
    let activitiesTotal = 0;
    let ticketsTotal = 0;
    let shoppingTotal = 0;
    const accommodationTotal = (trip.chosenStay?.pricePerNight || 6000) * Math.max(1, trip.days.length - 1);
    const otherTotal = Math.round(trip.budgetSummary.targetBudget * 0.05);

    trip.days.forEach(d => {
      d.activities.forEach(act => {
        if (act.budgetCategory === "Transport") transportTotal += act.cost;
        else if (act.budgetCategory === "Food") foodTotal += act.cost;
        else if (act.budgetCategory === "Activities") activitiesTotal += act.cost;
        else if (act.budgetCategory === "Tickets") ticketsTotal += act.cost;
        else if (act.budgetCategory === "Shopping") shoppingTotal += act.cost;
      });
    });

    const estimatedTotal = accommodationTotal + transportTotal + foodTotal + activitiesTotal + ticketsTotal + shoppingTotal + otherTotal;
    const remainingBudget = trip.budgetSummary.targetBudget - estimatedTotal;

    trip.budgetSummary = {
      targetBudget: trip.budgetSummary.targetBudget,
      estimatedTotal,
      remainingBudget,
      isUnderBudget: remainingBudget >= 0,
      breakdown: {
        accommodation: accommodationTotal,
        transport: transportTotal,
        food: foodTotal,
        activities: activitiesTotal,
        tickets: ticketsTotal,
        shopping: shoppingTotal,
        other: otherTotal
      }
    };
    return trip;
  }

  addActivityToDay(dayNumber, activityData) {
    const trip = JSON.parse(JSON.stringify(this.state.activeTripPlan));
    const dayObj = trip.days.find(d => d.day === dayNumber);
    if (dayObj) {
      dayObj.activities.push({
        id: `act-${Date.now()}`,
        timeSlot: activityData.timeSlot || "Afternoon",
        time: activityData.time || "03:00 PM",
        title: activityData.title || "Custom Sanctuary Exploration",
        location: activityData.location || trip.destination,
        travelTime: "15 min",
        duration: "2 Hours",
        category: activityData.category || "Experience",
        cost: activityData.cost || 1500,
        budgetCategory: activityData.budgetCategory || "Activities",
        openingInfo: "Open",
        recommendedTime: "Flexible",
        notes: activityData.notes || "Added custom activity.",
        icon: activityData.icon || "📍"
      });
      const updated = this.recalculateBudget(trip);
      this.setState({ activeTripPlan: updated });
      this.showToast(`✓ Added "${activityData.title}" to Day ${dayNumber}`);
    }
  }

  removeActivity(activityId) {
    const trip = JSON.parse(JSON.stringify(this.state.activeTripPlan));
    trip.days.forEach(d => {
      d.activities = d.activities.filter(a => a.id !== activityId);
    });
    const updated = this.recalculateBudget(trip);
    this.setState({ activeTripPlan: updated });
    this.showToast(`Removed activity from itinerary`);
  }

  moveActivity(activityId, direction) {
    const trip = JSON.parse(JSON.stringify(this.state.activeTripPlan));
    trip.days.forEach(d => {
      const idx = d.activities.findIndex(a => a.id === activityId);
      if (idx !== -1) {
        if (direction === "up" && idx > 0) {
          const temp = d.activities[idx];
          d.activities[idx] = d.activities[idx - 1];
          d.activities[idx - 1] = temp;
        } else if (direction === "down" && idx < d.activities.length - 1) {
          const temp = d.activities[idx];
          d.activities[idx] = d.activities[idx + 1];
          d.activities[idx + 1] = temp;
        }
      }
    });
    this.setState({ activeTripPlan: trip });
  }

  updateTripHotel(newHotelName, pricePerNight) {
    const trip = JSON.parse(JSON.stringify(this.state.activeTripPlan));
    trip.chosenStay = {
      name: newHotelName,
      pricePerNight
    };
    const updated = this.recalculateBudget(trip);
    this.setState({ activeTripPlan: updated });
    this.showToast(`🏨 Stay updated to ${newHotelName}`);
  }

  saveActiveTrip() {
    this.requireAuth(() => {
      const current = this.state.activeTripPlan;
      const list = [...this.state.savedTripPlans.filter(t => t.id !== current.id), current];
      this.setState({ savedTripPlans: list });
      this.showToast(`💾 "${current.title}" saved to your trips!`);
    });
  }

  duplicateActiveTrip() {
    const current = JSON.parse(JSON.stringify(this.state.activeTripPlan));
    current.id = "trip-" + Date.now();
    current.title = "Copy of " + current.title;
    const list = [...this.state.savedTripPlans, current];
    this.setState({ activeTripPlan: current, savedTripPlans: list });
    this.showToast(`✨ Duplicated itinerary as "${current.title}"`);
  }

  addSearchHistory(term) {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...this.state.searchHistory.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    this.setState({ searchHistory: updated });
  }

  clearSearchHistory() {
    this.setState({ searchHistory: [] });
  }

  toggleInterest(interest) {
    const current = [...this.state.selectedInterests];
    const idx = current.indexOf(interest);
    if (idx !== -1) current.splice(idx, 1);
    else current.push(interest);
    this.setState({ selectedInterests: current });
  }

  resetFilters() {
    this.setState({
      filterRegion: "all",
      budgetRange: "all",
      durationFilter: "all",
      travelTypeFilter: "all",
      selectedInterests: [],
      minRating: 0,
      maxDistance: 0,
      sortBy: "recommended",
      searchQuery: ""
    });
  }

  toggleWishlist(item) {
    const exists = this.state.wishlist.some(w => w.id === item.id);
    let updated;
    if (exists) {
      updated = this.state.wishlist.filter(w => w.id !== item.id);
      this.showToast(`Removed from Wishlist`);
    } else {
      updated = [
        ...this.state.wishlist,
        {
          id: item.id,
          name: item.name || item.title,
          type: item.type || (item.pricePerNight ? "stay" : item.duration ? "experience" : "destination"),
          image: item.image,
          country: item.country || "India",
          state: item.state || "",
          rating: item.rating,
          startingPrice: item.startingPrice || item.priceDisplay || "₹" + (item.pricePerNight || item.price || 0)
        }
      ];
      this.showToast(`Saved ❤️ to Wishlist`);
    }
    this.setState({ wishlist: updated });
    return !exists;
  }

  isWishlisted(id) {
    return this.state.wishlist.some(w => w.id === id);
  }

  addBooking(bookingData) {
    const newBooking = {
      id: "BK-" + Math.floor(10000 + Math.random() * 90000),
      bookingDate: new Date().toISOString().split("T")[0],
      voucherCode: "AV-" + (bookingData.destinationId || "IND").toUpperCase().slice(0, 3) + "-" + Math.floor(10000 + Math.random() * 90000),
      status: "Confirmed",
      ...bookingData
    };
    const updated = [newBooking, ...this.state.bookings];
    this.saveToStorage("auricvista_user_bookings", updated);
    this.setState({ bookings: updated });
    return newBooking;
  }

  addAiMessage(sender, text, suggestions = null) {
    const newMessage = {
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions
    };
    this.setState({ aiMessages: [...this.state.aiMessages, newMessage] });
  }

  // Pure session-based nearby location search actions (No persistence)
  setUserLocation(location) {
    this.setState({ userLocation: location });
  }

  setNearbyDestinations(destinations) {
    this.setState({ nearbyDestinations: destinations });
  }

  setSelectedNearbyDestination(dest) {
    this.setState({
      selectedNearbyDestination: dest,
      isNearbySearchActive: !!dest,
      searchQuery: dest ? dest.name : ""
    });
  }

  clearNearbyDestinationFilter() {
    this.setState({
      selectedNearbyDestination: null,
      isNearbySearchActive: false,
      searchQuery: ""
    });
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  // ===========================================================================
  // TEAM-BASED TRIP COLLABORATION STORE & API INTEGRATION
  // ===========================================================================

  setActiveCollabWorkspaceTab(tab) {
    this.setState({ activeCollabWorkspaceTab: tab });
  }

  setCurrentCollabTrip(trip) {
    if (trip) {
      this.saveToStorage("auricvyom_cached_collab_trip", trip);
      if (trip.id) {
        localStorage.setItem("auricvyom_active_collab_trip_id", trip.id);
      }
    } else {
      localStorage.removeItem("auricvyom_cached_collab_trip");
      localStorage.removeItem("auricvyom_active_collab_trip_id");
    }
    this.setState({ currentCollabTrip: trip });
  }

  getAuthHeaders() {
    const token = authService.getStoredToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  }

  async fetchCollabTrips() {
    this.setState({ collabLoading: true });
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips`, {
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        this.saveToStorage("auricvyom_cached_collab_trips", data.data);
        this.setState({ collabTrips: data.data, collabLoading: false });
        return data.data;
      }
    } catch (err) {
      console.warn("[CollabTrips] fetchCollabTrips failed, using cache if available:", err);
    }
    this.setState({ collabLoading: false });
    return this.state.collabTrips;
  }

  async fetchCollabTripDetails(tripId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}`, {
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        this.saveToStorage("auricvyom_cached_collab_trip", data.data);
        localStorage.setItem("auricvyom_active_collab_trip_id", tripId);
        this.setState({ currentCollabTrip: data.data });
        this.initCollabSSE(tripId);
        this.fetchCollabSettlement(tripId);
        return data.data;
      } else {
        if (res.status === 401) {
          const refreshed = await authService.refreshTokens();
          if (refreshed) {
            return this.fetchCollabTripDetails(tripId);
          }
        }
        if (res.status === 404) {
          localStorage.removeItem("auricvyom_cached_collab_trip");
          localStorage.removeItem("auricvyom_active_collab_trip_id");
          this.setState({ currentCollabTrip: null });
        }
        console.warn("[CollabTrips] fetchCollabTripDetails notice:", data?.message);
      }
    } catch (err) {
      console.warn("[CollabTrips] fetchCollabTripDetails network issue, maintaining cached trip:", err);
    }
    return this.state.currentCollabTrip;
  }

  async createCollabTrip(payload) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("✨ Collaborative trip created! Invite code ready.");
        await this.fetchCollabTrips();
        if (data.data?.id) {
          await this.fetchCollabTripDetails(data.data.id);
        }
        return data.data;
      } else {
        this.showToast(data.message || "Failed to create trip");
        return null;
      }
    } catch (err) {
      console.error("[CollabTrips] createCollabTrip error:", err);
      this.showToast("Network error creating trip");
      return null;
    }
  }

  async previewInviteCode(code) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/preview/${encodeURIComponent(code)}`);
      return await res.json();
    } catch (err) {
      return { success: false, message: "Could not preview invite code" };
    }
  }

  async joinCollabTrip(inviteCode) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/join`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ inviteCode })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("🎉 " + data.message);
        await this.fetchCollabTrips();
        const tripId = data.data?.tripId || data.data?.trip?.id || data.data?.id;
        if (tripId) {
          await this.fetchCollabTripDetails(tripId);
        }
        return data;
      } else {
        this.showToast(data.message || "Failed to join trip");
        return null;
      }
    } catch (err) {
      console.error("[CollabTrips] joinCollabTrip error:", err);
      this.showToast("Network error joining trip");
      return null;
    }
  }

  async transferCollabOwnership(tripId, toUserId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/transfer-ownership`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ toUserId })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("👑 " + data.message);
        await this.fetchCollabTripDetails(tripId);
        return true;
      } else {
        this.showToast(data.message || "Failed to transfer ownership");
        return false;
      }
    } catch (err) {
      this.showToast("Error transferring ownership");
      return false;
    }
  }

  async removeCollabMember(tripId, memberUserId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/members/${memberUserId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Member removed from trip");
        await this.fetchCollabTripDetails(tripId);
        return true;
      } else {
        this.showToast(data.message || "Failed to remove member");
        return false;
      }
    } catch (err) {
      this.showToast("Error removing member");
      return false;
    }
  }

  async leaveCollabTrip(tripId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/leave`, {
        method: "POST",
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message || "You have left the trip");
        localStorage.removeItem("auricvyom_cached_collab_trip");
        localStorage.removeItem("auricvyom_active_collab_trip_id");
        this.setState({ currentCollabTrip: null });
        this.closeCollabSSE();
        await this.fetchCollabTrips();
        return true;
      } else {
        this.showToast(data.message || "Cannot leave trip");
        return false;
      }
    } catch (err) {
      this.showToast("Error leaving trip");
      return false;
    }
  }

  async addCollabItineraryItem(tripId, item) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/itinerary`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Added to itinerary");
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      } else {
        this.showToast(data.message || "Could not add item");
      }
    } catch (err) {
      this.showToast("Failed to add itinerary item");
    }
  }

  async updateCollabItineraryItem(tripId, itemId, item) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/itinerary/${itemId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Itinerary item updated");
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      }
    } catch (err) {
      this.showToast("Failed to update item");
    }
  }

  async deleteCollabItineraryItem(tripId, itemId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/itinerary/${itemId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Item deleted from itinerary");
        await this.fetchCollabTripDetails(tripId);
        return true;
      }
    } catch (err) {
      this.showToast("Failed to delete item");
    }
  }

  async addCollabSavedPlace(tripId, place) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/places`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(place)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Place saved to shared trip");
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      }
    } catch (err) {
      this.showToast("Failed to save place");
    }
  }

  async deleteCollabSavedPlace(tripId, placeId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/places/${placeId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Place removed");
        await this.fetchCollabTripDetails(tripId);
        return true;
      }
    } catch (err) {
      this.showToast("Failed to remove place");
    }
  }

  async createCollabPoll(tripId, pollData) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/polls`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(pollData)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("📊 Poll created!");
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      } else {
        this.showToast(data.message || "Failed to create poll");
      }
    } catch (err) {
      this.showToast("Error creating poll");
    }
  }

  async voteCollabPoll(tripId, pollId, optionId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/polls/${pollId}/vote`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ optionId })
      });
      const data = await res.json();
      if (data.success) {
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      }
    } catch (err) {
      console.error("[CollabTrips] voteCollabPoll error:", err);
    }
  }

  async closeCollabPoll(tripId, pollId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/polls/${pollId}/close`, {
        method: "PUT",
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Poll closed");
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      }
    } catch (err) {
      this.showToast("Error closing poll");
    }
  }

  async createCollabExpense(tripId, expenseData) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/expenses`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("💰 Expense added & split computed!");
        this.fetchCollabSettlement(tripId);
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      } else {
        this.showToast(data.message || "Failed to record expense");
      }
    } catch (err) {
      this.showToast("Error recording expense");
    }
  }

  async updateCollabExpense(tripId, expenseId, expenseData) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/expenses/${expenseId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Expense updated");
        this.fetchCollabSettlement(tripId);
        await this.fetchCollabTripDetails(tripId);
        return data.data;
      }
    } catch (err) {
      this.showToast("Error updating expense");
    }
  }

  async deleteCollabExpense(tripId, expenseId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.showToast("Expense soft-deleted (logged in financial audit)");
        this.fetchCollabSettlement(tripId);
        await this.fetchCollabTripDetails(tripId);
        return true;
      }
    } catch (err) {
      this.showToast("Error deleting expense");
    }
  }

  async fetchCollabSettlement(tripId) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/expenses/settlement`, {
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.setState({ collabSettlement: data.data });
        return data.data;
      }
    } catch (err) {
      console.warn("[CollabTrips] fetchCollabSettlement error:", err);
    }
  }

  async sendCollabMessage(tripId, text) {
    try {
      const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/trips/${tripId}/messages`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
    } catch (err) {
      this.showToast("Error sending message");
    }
  }

  initCollabSSE(tripId) {
    this.closeCollabSSE();

    const token = authService.getStoredToken();
    const apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
    const sseUrl = `${apiBase}/trips/${tripId}/events?token=${encodeURIComponent(token || "")}`;

    try {
      this.collabEventSource = new EventSource(sseUrl);

      const refreshTrip = () => {
        if (this.state.currentCollabTrip?.id === tripId) {
          this.fetchCollabTripDetails(tripId);
        }
      };

      this.collabEventSource.addEventListener("ITINERARY_ITEM_ADDED", refreshTrip);
      this.collabEventSource.addEventListener("ITINERARY_ITEM_UPDATED", refreshTrip);
      this.collabEventSource.addEventListener("ITINERARY_ITEM_DELETED", refreshTrip);
      this.collabEventSource.addEventListener("PLACE_ADDED", refreshTrip);
      this.collabEventSource.addEventListener("PLACE_DELETED", refreshTrip);
      this.collabEventSource.addEventListener("POLL_CREATED", refreshTrip);
      this.collabEventSource.addEventListener("POLL_VOTED", refreshTrip);
      this.collabEventSource.addEventListener("POLL_CLOSED", refreshTrip);
      this.collabEventSource.addEventListener("EXPENSE_ADDED", refreshTrip);
      this.collabEventSource.addEventListener("EXPENSE_UPDATED", refreshTrip);
      this.collabEventSource.addEventListener("EXPENSE_DELETED", refreshTrip);
      this.collabEventSource.addEventListener("MEMBER_JOINED", refreshTrip);
      this.collabEventSource.addEventListener("OWNERSHIP_TRANSFERRED", refreshTrip);
      this.collabEventSource.addEventListener("MEMBER_REMOVED", refreshTrip);
      this.collabEventSource.addEventListener("MEMBER_LEFT", refreshTrip);
      this.collabEventSource.addEventListener("TRIP_UPDATED", refreshTrip);

      this.collabEventSource.addEventListener("NEW_CHAT_MESSAGE", (e) => {
        try {
          const parsed = JSON.parse(e.data);
          const msg = parsed.payload;
          if (this.state.currentCollabTrip && msg) {
            const currentMsgs = this.state.currentCollabTrip.messages || [];
            if (!currentMsgs.some(m => m.id === msg.id)) {
              this.setState({
                currentCollabTrip: {
                  ...this.state.currentCollabTrip,
                  messages: [...currentMsgs, msg]
                }
              });
            }
          }
        } catch (err) {}
      });

      this.collabEventSource.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch (err) {
      console.warn("[CollabTrips] SSE connection error:", err);
    }
  }

  closeCollabSSE() {
    if (this.collabEventSource) {
      try {
        this.collabEventSource.close();
      } catch (e) {}
      this.collabEventSource = null;
    }
  }
}

export const appState = new StateManager();
