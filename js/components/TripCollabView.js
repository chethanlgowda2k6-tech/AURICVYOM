// AURICVYOM Team-Based Trip Collaboration Feature
// Luxury dark obsidian & gold glassmorphism collaborative trip workspace

import { appState } from "../state.js";
import { DESTINATIONS } from "../data/destinations.js";

export function renderTripCollabView() {
  const container = document.createElement("div");
  container.className = "trip-collab-view-container";
  container.id = "trip-collab-view-root";

  let activeDayFilter = "all";

  const render = async () => {
    const {
      currentCollabTrip,
      collabTrips,
      collabLoading,
      activeCollabWorkspaceTab,
      collabSettlement,
      currentUser,
      isAuthenticated
    } = appState.getState();

    // If not authenticated, prompt sign-in gate
    if (!isAuthenticated || !currentUser) {
      container.innerHTML = `
        <div class="content-container section-spacing" style="padding-top: 100px; text-align: center;">
          <div style="background: var(--bg-card); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 60px 32px; max-width: 600px; margin: 0 auto; box-shadow: var(--shadow-lg);">
            <div style="font-size: 3rem; margin-bottom: 16px;">👑</div>
            <span class="section-tag-gold">COLLABORATIVE EXPEDITIONS</span>
            <h2 style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-white); margin-top: 12px; margin-bottom: 16px;">
              Plan Together, Travel Bespoke
            </h2>
            <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 32px;">
              Sign in to your AuricVyom account to create shared journeys, invite co-owners via unique codes, vote on palace visits, and split luxury stays seamlessly.
            </p>
            <button class="btn-primary-gold" id="collab-gate-login-btn" style="padding: 14px 36px; font-size: 1rem;">
              Sign In / Register
            </button>
          </div>
        </div>
      `;
      container.querySelector("#collab-gate-login-btn")?.addEventListener("click", () => {
        appState.openAuth("login");
      });
      return;
    }

    // -------------------------------------------------------------------------
    // VIEW 1: COLLABORATIVE TRIPS HUB (If no trip selected)
    // -------------------------------------------------------------------------
    if (!currentCollabTrip) {
      container.innerHTML = `
        <div class="content-container section-spacing" style="padding-top: 100px;">
          <!-- Hero Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 24px; margin-bottom: 40px;">
            <div>
              <span class="section-tag-gold">TEAM-BASED TRIP COLLABORATION</span>
              <h1 class="section-main-title" style="margin-top: 8px;">
                Shared Journeys Workspace
              </h1>
              <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 650px; margin-top: 8px;">
                Turn solo itineraries into real-time collaborative luxury expeditions with unique invite codes, two co-owners, shared day timelines, group polls, and split billing.
              </p>
            </div>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <button class="btn-outline-glass" id="open-join-trip-modal-btn" style="padding: 12px 24px; font-size: 0.95rem;">
                🔑 Join via Invite Code
              </button>
              <button class="btn-primary-gold" id="open-create-trip-modal-btn" style="padding: 12px 28px; font-size: 0.95rem;">
                ✨ Create Shared Journey
              </button>
            </div>
          </div>

          <!-- Trip Cards Grid -->
          ${collabLoading ? `
            <div style="padding: 80px 0; text-align: center; color: var(--gold-light);">
              <div class="spinner" style="margin: 0 auto 16px;"></div>
              <p>Loading your collaborative journeys...</p>
            </div>
          ` : collabTrips && collabTrips.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 28px;">
              ${collabTrips.map(trip => {
                const statusColor = trip.status === 'UPCOMING' ? '#10b981' : trip.status === 'ONGOING' ? '#06b6d4' : '#d4af37';
                const statusLabel = trip.status === 'UPCOMING' ? 'Upcoming' : trip.status === 'ONGOING' ? 'Ongoing' : 'Completed';
                const isOwner = trip.userRole === 'OWNER';
                const defaultImage = "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80";

                return `
                  <div class="destination-card collab-trip-card" data-trip-id="${trip.id}" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="card-media-wrapper" style="height: 200px; position: relative;">
                      <img src="${trip.coverImage || defaultImage}" alt="${trip.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                      <div class="card-image-overlay"></div>
                      
                      <!-- Status Pill -->
                      <div style="position: absolute; top: 16px; left: 16px; background: rgba(3, 5, 8, 0.85); backdrop-filter: blur(8px); border: 1px solid ${statusColor}; color: ${statusColor}; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.05em;">
                        ● ${statusLabel}
                      </div>

                      <!-- Role Pill -->
                      <div style="position: absolute; top: 16px; right: 16px; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--border-gold); color: var(--gold-light); font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full);">
                        ${isOwner ? '👑 Co-Owner' : '👥 Member'}
                      </div>
                    </div>

                    <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                      <div>
                        <div style="font-size: 0.82rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                          📍 ${trip.destination}
                        </div>
                        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white); margin-bottom: 12px; line-height: 1.3;">
                          ${trip.name}
                        </h3>
                        <div style="display: flex; gap: 16px; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
                          <span>🗓️ ${trip.durationDays} Days</span>
                          <span>•</span>
                          <span>${trip.daysUntilTrip > 0 ? `${trip.daysUntilTrip} days away` : 'In progress'}</span>
                        </div>
                      </div>

                      <!-- Members and Action Row -->
                      <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: -8px;">
                          ${(trip.members || []).slice(0, 4).map((m, idx) => `
                            <img src="${m.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" 
                                 title="${m.user?.name || 'Member'}"
                                 style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--bg-surface); object-fit: cover; margin-left: ${idx > 0 ? '-10px' : '0'};" />
                          `).join('')}
                          ${(trip.members || []).length > 4 ? `
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--border-gold); color: #000; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: -10px; border: 2px solid var(--bg-surface);">
                              +${trip.members.length - 4}
                            </div>
                          ` : ''}
                        </div>
                        
                        <span style="color: var(--gold-primary); font-size: 0.9rem; font-weight: 700;">
                          Open Workspace →
                        </span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <!-- Empty State -->
            <div style="background: var(--bg-card); border: 1px dashed var(--border-gold); border-radius: var(--radius-lg); padding: 80px 24px; text-align: center; max-width: 700px; margin: 0 auto;">
              <div style="font-size: 3rem; margin-bottom: 16px;">🗺️</div>
              <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--text-white); margin-bottom: 12px;">
                No Collaborative Trips Yet
              </h3>
              <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 28px; line-height: 1.7;">
                Start planning your next getaway with co-owners, friends, or family. Or join an existing squad using their unique invite code.
              </p>
              <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary-gold" id="empty-create-trip-btn" style="padding: 12px 28px;">
                  ✨ Create Collaborative Trip
                </button>
                <button class="btn-outline-glass" id="empty-join-trip-btn" style="padding: 12px 24px;">
                  🔑 Join with Code
                </button>
              </div>
            </div>
          `}
        </div>
      `;

      // Event Listeners for Hub
      container.querySelectorAll(".collab-trip-card").forEach(card => {
        card.addEventListener("click", () => {
          const tripId = card.dataset.tripId;
          appState.fetchCollabTripDetails(tripId);
        });
      });

      const openCreateModal = () => renderCreateTripModal();
      const openJoinModal = () => renderJoinTripModal();

      container.querySelector("#open-create-trip-modal-btn")?.addEventListener("click", openCreateModal);
      container.querySelector("#empty-create-trip-btn")?.addEventListener("click", openCreateModal);
      container.querySelector("#open-join-trip-modal-btn")?.addEventListener("click", openJoinModal);
      container.querySelector("#empty-join-trip-btn")?.addEventListener("click", openJoinModal);

      return;
    }

    // -------------------------------------------------------------------------
    // VIEW 2: INTERACTIVE COLLABORATIVE TRIP WORKSPACE
    // -------------------------------------------------------------------------
    const trip = currentCollabTrip;
    const isOwner = trip.userRole === 'OWNER';
    const owners = trip.owners || [];
    const members = trip.members || [];
    const itinerary = trip.itineraryItems || [];
    const savedPlaces = trip.savedPlaces || [];
    const polls = trip.polls || [];
    const expenses = (trip.expenses || []).filter(e => !e.deletedAt);
    const deletedExpenses = (trip.expenses || []).filter(e => !!e.deletedAt);
    const messages = trip.messages || [];

    const statusColor = trip.status === 'UPCOMING' ? '#10b981' : trip.status === 'ONGOING' ? '#06b6d4' : '#d4af37';
    const statusLabel = trip.status === 'UPCOMING' ? 'Upcoming' : trip.status === 'ONGOING' ? 'Ongoing' : 'Completed';

    // Group itinerary items by day
    const itineraryDays = Array.from({ length: trip.durationDays || 3 }, (_, i) => i + 1);
    const filteredItinerary = activeDayFilter === "all"
      ? itinerary
      : itinerary.filter(item => item.dayNumber === Number(activeDayFilter));

    container.innerHTML = `
      <div class="content-container section-spacing" style="padding-top: 90px;">
        <!-- Top Back Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <button id="back-to-hub-btn" class="btn-outline-glass" style="padding: 8px 18px; font-size: 0.88rem; gap: 8px;">
            ← All Collaborative Trips
          </button>
          
          <div style="display: flex; gap: 12px; align-items: center;">
            ${isOwner ? `
              <button id="workspace-settings-btn" class="btn-outline-glass" style="padding: 8px 16px; font-size: 0.85rem; border-color: var(--border-gold);">
                ⚙️ Manage Squad & Owners
              </button>
            ` : `
              <button id="workspace-leave-btn" class="btn-outline-glass" style="padding: 8px 16px; font-size: 0.85rem; color: #f43f5e; border-color: rgba(244,63,94,0.3);">
                Leave Trip
              </button>
            `}
          </div>
        </div>

        <!-- Workspace Hero Header -->
        <div style="background: linear-gradient(135deg, rgba(18,27,43,0.95), rgba(7,9,14,0.98)), url('${trip.coverImage || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1400&q=80'}') center/cover; border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 36px 32px; margin-bottom: 32px; box-shadow: var(--shadow-lg); position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 24px;">
            <div>
              <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
                <span style="background: rgba(3, 5, 8, 0.85); border: 1px solid ${statusColor}; color: ${statusColor}; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); text-transform: uppercase;">
                  ● ${statusLabel}
                </span>
                <span style="background: rgba(212,175,55,0.12); border: 1px solid var(--border-gold); color: var(--gold-light); font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full);">
                  📍 ${trip.destination}
                </span>
                <span style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: var(--radius-full);">
                  🗓️ ${trip.durationDays} Days • ${trip.daysUntilTrip > 0 ? `${trip.daysUntilTrip} Days Away` : 'Active'}
                </span>
              </div>

              <h1 style="font-family: var(--font-serif); font-size: clamp(2rem, 3.5vw, 2.8rem); color: var(--text-white); margin-bottom: 10px; line-height: 1.2;">
                ${trip.name}
              </h1>

              <!-- Invite Codes Badges -->
              <div style="display: flex; gap: 12px; align-items: center; margin-top: 16px; flex-wrap: wrap;">
                <div style="background: rgba(0,0,0,0.65); border: 1px dashed var(--border-gold); border-radius: var(--radius-md); padding: 6px 14px; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 0.75rem; color: var(--text-secondary);">Invite Code:</span>
                  <strong style="color: var(--gold-light); font-family: monospace; font-size: 0.95rem; letter-spacing: 0.05em;">${trip.inviteCode}</strong>
                  <button id="copy-invite-code-btn" style="background: none; border: none; cursor: pointer; color: var(--gold-primary); padding: 0 4px;" title="Copy Invite Code">
                    📋
                  </button>
                </div>

                ${isOwner && trip.coOwnerInviteCode ? `
                  <div style="background: rgba(212,175,55,0.15); border: 1px solid var(--gold-primary); border-radius: var(--radius-md); padding: 6px 14px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 0.75rem; color: var(--gold-light);">👑 2nd Co-Owner Code:</span>
                    <strong style="color: #fff; font-family: monospace; font-size: 0.95rem;">${trip.coOwnerInviteCode}</strong>
                    <button id="copy-coowner-code-btn" style="background: none; border: none; cursor: pointer; color: var(--gold-light); padding: 0 4px;" title="Copy Co-Owner Code">
                      📋
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Members Stack & 2 Co-Owners Indicator -->
            <div style="background: rgba(8, 12, 20, 0.75); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px 20px; min-width: 260px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                Co-Owners (2 Required) & Squad (${members.length})
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${members.map(m => {
                  const isCoOwner = m.role === 'OWNER';
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${m.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isCoOwner ? 'var(--gold-primary)' : 'rgba(255,255,255,0.2)'};" />
                        <span style="font-size: 0.88rem; color: var(--text-white); font-weight: ${isCoOwner ? '700' : '400'};">
                          ${m.user?.name} ${m.userId === currentUser.id ? '(You)' : ''}
                        </span>
                      </div>
                      <span style="font-size: 0.75rem; font-weight: 700; color: ${isCoOwner ? 'var(--gold-light)' : 'var(--text-muted)'};">
                        ${isCoOwner ? '👑 Co-Owner' : 'Member'}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- 5-Tab Workspace Navigation Bar -->
        <div style="display: flex; gap: 8px; border-bottom: 1.5px solid var(--border-gold); padding-bottom: 4px; margin-bottom: 32px; overflow-x: auto; -webkit-overflow-scrolling: touch;">
          <button class="collab-tab-nav ${activeCollabWorkspaceTab === 'itinerary' ? 'active' : ''}" data-tab="itinerary">
            🗓️ Shared Itinerary (${itinerary.length})
          </button>
          <button class="collab-tab-nav ${activeCollabWorkspaceTab === 'places' ? 'active' : ''}" data-tab="places">
            📍 Saved Places (${savedPlaces.length})
          </button>
          <button class="collab-tab-nav ${activeCollabWorkspaceTab === 'polls' ? 'active' : ''}" data-tab="polls">
            📊 Group Polls (${polls.length})
          </button>
          <button class="collab-tab-nav ${activeCollabWorkspaceTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
            💰 Split Expenses (${expenses.length})
          </button>
          <button class="collab-tab-nav ${activeCollabWorkspaceTab === 'chat' ? 'active' : ''}" data-tab="chat">
            💬 Live Squad Chat (${messages.length})
          </button>
        </div>

        <!-- Dynamic Tab Contents Mount -->
        <div id="collab-tab-content-mount"></div>
      </div>
    `;

    // -------------------------------------------------------------------------
    // TAB CONTENT RENDERING
    // -------------------------------------------------------------------------
    const tabMount = container.querySelector("#collab-tab-content-mount");
    if (!tabMount) return;

    // TAB 1: SHARED ITINERARY
    if (activeCollabWorkspaceTab === "itinerary") {
      tabMount.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
          <!-- Day Filter Selector -->
          <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 0;">
            <button class="filter-pill-btn ${activeDayFilter === 'all' ? 'active' : ''}" data-day="all">All Days</button>
            ${itineraryDays.map(d => `
              <button class="filter-pill-btn ${activeDayFilter === String(d) ? 'active' : ''}" data-day="${d}">Day ${d}</button>
            `).join('')}
          </div>

          <button class="btn-primary-gold" id="open-add-itinerary-btn" style="padding: 10px 22px; font-size: 0.9rem;">
            + Add Activity to Itinerary
          </button>
        </div>

        <!-- Timeline Items -->
        ${filteredItinerary.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${filteredItinerary.map(item => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; transition: transform 0.2s;" class="itinerary-card">
                <div style="display: flex; gap: 20px; align-items: flex-start;">
                  <div style="text-align: center; min-width: 60px; padding: 10px 8px; background: rgba(212,175,55,0.08); border: 1px solid var(--border-gold); border-radius: var(--radius-md);">
                    <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase;">DAY</div>
                    <div style="font-size: 1.4rem; font-family: var(--font-serif); color: var(--text-white); font-weight: 700;">${item.dayNumber}</div>
                  </div>

                  <div>
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
                      <span style="background: rgba(255,255,255,0.06); font-size: 0.75rem; color: var(--gold-light); padding: 3px 10px; border-radius: var(--radius-full); font-weight: 600;">
                        ${item.category || 'ACTIVITY'}
                      </span>
                      ${item.startTime ? `
                        <span style="color: var(--text-secondary); font-size: 0.8rem; font-weight: 600;">
                          ⏰ ${item.startTime} ${item.endTime ? `– ${item.endTime}` : ''}
                        </span>
                      ` : ''}
                      ${item.cost ? `
                        <span style="color: var(--gold-light); font-size: 0.8rem; font-weight: 700;">
                          ₹${Number(item.cost).toLocaleString()}
                        </span>
                      ` : ''}
                    </div>

                    <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--text-white); margin-bottom: 6px;">
                      ${item.title}
                    </h4>

                    ${item.location ? `
                      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
                        📍 ${item.location}
                      </div>
                    ` : ''}

                    ${item.description ? `
                      <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
                        ${item.description}
                      </p>
                    ` : ''}

                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                      Added by ${item.createdBy?.name || 'Member'}
                    </div>
                  </div>
                </div>

                <!-- Item Actions -->
                <div style="display: flex; gap: 8px;">
                  <button class="delete-itinerary-item-btn" data-item-id="${item.id}" style="background: none; border: 1px solid rgba(244,63,94,0.3); color: #f43f5e; border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; font-size: 0.8rem;" title="Delete Activity">
                    🗑️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 60px 24px; text-align: center;">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">No activities scheduled for this day yet.</p>
            <button class="btn-outline-glass" id="empty-add-itinerary-btn" style="padding: 10px 20px;">
              + Add First Activity
            </button>
          </div>
        `}
      `;

      // Filter day listener
      tabMount.querySelectorAll("[data-day]").forEach(btn => {
        btn.addEventListener("click", () => {
          activeDayFilter = btn.dataset.day;
          render();
        });
      });

      tabMount.querySelector("#open-add-itinerary-btn")?.addEventListener("click", () => renderAddItineraryModal(trip.id, activeDayFilter === "all" ? 1 : Number(activeDayFilter)));
      tabMount.querySelector("#empty-add-itinerary-btn")?.addEventListener("click", () => renderAddItineraryModal(trip.id, 1));

      tabMount.querySelectorAll(".delete-itinerary-item-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (confirm("Remove this activity from the shared itinerary?")) {
            await appState.deleteCollabItineraryItem(trip.id, btn.dataset.itemId);
          }
        });
      });
    }

    // TAB 2: SAVED PLACES
    else if (activeCollabWorkspaceTab === "places") {
      tabMount.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white);">Shared Saved Places</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Pin monuments, dining havens, and spots suggested by any squad member.</p>
          </div>
          <button class="btn-primary-gold" id="open-add-place-btn" style="padding: 10px 22px; font-size: 0.9rem;">
            + Pin New Spot
          </button>
        </div>

        ${savedPlaces.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 20px;">
            ${savedPlaces.map(place => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <span style="font-size: 0.75rem; background: rgba(212,175,55,0.12); color: var(--gold-light); font-weight: 700; padding: 2px 10px; border-radius: var(--radius-full);">
                      ${place.category}
                    </span>
                    <button class="delete-place-btn" data-place-id="${place.id}" style="background: none; border: none; color: #f43f5e; cursor: pointer; font-size: 0.9rem;">✕</button>
                  </div>
                  <h4 style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--text-white); margin-bottom: 6px;">
                    ${place.name}
                  </h4>
                  ${place.address ? `<div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">📍 ${place.address}</div>` : ''}
                  ${place.notes ? `<p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">${place.notes}</p>` : ''}
                </div>

                <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.72rem; color: var(--text-muted);">Added by ${place.addedBy?.name || 'Member'}</span>
                  <button class="btn-outline-glass add-place-to-itinerary-btn" data-place-name="${place.name}" data-place-category="${place.category}" style="padding: 6px 12px; font-size: 0.78rem;">
                    + Add to Day
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 60px 24px; text-align: center;">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">No places saved yet.</p>
            <button class="btn-outline-glass" id="empty-add-place-btn" style="padding: 10px 20px;">
              + Save Your First Spot
            </button>
          </div>
        `}
      `;

      tabMount.querySelector("#open-add-place-btn")?.addEventListener("click", () => renderAddPlaceModal(trip.id));
      tabMount.querySelector("#empty-add-place-btn")?.addEventListener("click", () => renderAddPlaceModal(trip.id));

      tabMount.querySelectorAll(".delete-place-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (confirm("Remove this place?")) {
            await appState.deleteCollabSavedPlace(trip.id, btn.dataset.placeId);
          }
        });
      });

      tabMount.querySelectorAll(".add-place-to-itinerary-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          renderAddItineraryModal(trip.id, 1, {
            title: btn.dataset.placeName,
            category: btn.dataset.placeCategory
          });
        });
      });
    }

    // TAB 3: GROUP POLLS
    else if (activeCollabWorkspaceTab === "polls") {
      tabMount.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white);">Squad Decision Polls</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              ${isOwner ? 'As a Co-Owner, you can launch polls to resolve dining, villa choices, and stops.' : 'Cast your vote below! (Only the two Co-Owners can create new polls).'}
            </p>
          </div>
          ${isOwner ? `
            <button class="btn-primary-gold" id="open-create-poll-btn" style="padding: 10px 22px; font-size: 0.9rem;">
              + Create Poll
            </button>
          ` : ''}
        </div>

        ${polls.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 24px;">
            ${polls.map(poll => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || []).length, 0);
              const isClosed = poll.status === 'CLOSED';

              return `
                <div style="background: var(--bg-card); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div>
                      <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
                        <span style="background: ${isClosed ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.15)'}; border: 1px solid ${isClosed ? 'var(--border-subtle)' : '#10b981'}; color: ${isClosed ? 'var(--text-muted)' : '#10b981'}; font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: var(--radius-full);">
                          ${isClosed ? 'CLOSED' : 'ACTIVE POLL'}
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">
                          Created by ${poll.createdBy?.name || 'Owner'}
                        </span>
                      </div>
                      <h4 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--text-white);">
                        ${poll.question}
                      </h4>
                    </div>

                    ${isOwner && !isClosed ? `
                      <button class="close-poll-btn btn-outline-glass" data-poll-id="${poll.id}" style="padding: 6px 12px; font-size: 0.78rem;">
                        Close Poll
                      </button>
                    ` : ''}
                  </div>

                  <!-- Options List -->
                  <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
                    ${poll.options.map(opt => {
                      const voteCount = (opt.votes || []).length;
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                      const hasVoted = (opt.votes || []).some(v => v.userId === currentUser.id);

                      return `
                        <div class="poll-option-row ${hasVoted ? 'voted' : ''}" data-poll-id="${poll.id}" data-option-id="${opt.id}" style="background: rgba(8,12,20,0.85); border: 1.5px solid ${hasVoted ? 'var(--gold-primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: 14px 18px; cursor: ${isClosed ? 'default' : 'pointer'}; position: relative; overflow: hidden; transition: border-color 0.2s;">
                          <!-- Fill bar -->
                          <div style="position: absolute; top: 0; left: 0; bottom: 0; width: ${percentage}%; background: rgba(212,175,55,0.12); z-index: 1;"></div>
                          
                          <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <span style="width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid ${hasVoted ? 'var(--gold-primary)' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--gold-light);">
                                ${hasVoted ? '✓' : ''}
                              </span>
                              <span style="font-size: 0.95rem; color: var(--text-white); font-weight: ${hasVoted ? '700' : '500'};">
                                ${opt.text}
                              </span>
                            </div>

                            <div style="display: flex; align-items: center; gap: 14px;">
                              <!-- Avatars who voted -->
                              <div style="display: flex; gap: -6px;">
                                ${(opt.votes || []).map((v, i) => `
                                  <img src="${v.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" title="${v.user?.name}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--bg-surface); margin-left: ${i > 0 ? '-8px' : '0'};" />
                                `).join('')}
                              </div>
                              <span style="font-size: 0.85rem; color: var(--gold-light); font-weight: 700; min-width: 45px; text-align: right;">
                                ${voteCount} (${percentage}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>

                  <div style="margin-top: 14px; font-size: 0.8rem; color: var(--text-muted); text-align: right;">
                    ${totalVotes} total votes cast
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 60px 24px; text-align: center;">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">No decision polls created yet.</p>
            ${isOwner ? `
              <button class="btn-outline-glass" id="empty-create-poll-btn" style="padding: 10px 20px;">
                + Create First Poll
              </button>
            ` : ''}
          </div>
        `}
      `;

      tabMount.querySelector("#open-create-poll-btn")?.addEventListener("click", () => renderCreatePollModal(trip.id));
      tabMount.querySelector("#empty-create-poll-btn")?.addEventListener("click", () => renderCreatePollModal(trip.id));

      tabMount.querySelectorAll(".poll-option-row").forEach(row => {
        row.addEventListener("click", async () => {
          const pollId = row.dataset.pollId;
          const optionId = row.dataset.optionId;
          await appState.voteCollabPoll(trip.id, pollId, optionId);
        });
      });

      tabMount.querySelectorAll(".close-poll-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm("Close this poll? Voting will end.")) {
            await appState.closeCollabPoll(trip.id, btn.dataset.pollId);
          }
        });
      });
    }

    // TAB 4: GROUP EXPENSES & SPLITTER
    else if (activeCollabWorkspaceTab === "expenses") {
      const targetBudget = trip.targetBudget || 0;
      const budgetPct = targetBudget > 0 ? Math.min(100, Math.round((trip.totalExpenses / targetBudget) * 100)) : 0;
      const settlements = collabSettlement?.settlements || [];

      tabMount.innerHTML = `
        <!-- Budget & Totals Banner -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 20px; margin-bottom: 32px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 24px;">
            <div style="font-size: 0.78rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase;">Total Shared Expenses</div>
            <div style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-white); margin: 6px 0;">
              ₹${Number(trip.totalExpenses || 0).toLocaleString()}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${expenses.length} active transactions</div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px;">
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Target Budget</div>
            <div style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-white); margin: 6px 0;">
              ${targetBudget > 0 ? `₹${Number(targetBudget).toLocaleString()}` : 'Not set'}
            </div>
            ${targetBudget > 0 ? `
              <div style="background: rgba(255,255,255,0.08); height: 6px; border-radius: var(--radius-full); overflow: hidden; margin-top: 8px;">
                <div style="background: ${budgetPct > 90 ? '#f43f5e' : 'var(--gold-primary)'}; width: ${budgetPct}%; height: 100%;"></div>
              </div>
            ` : ''}
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <button class="btn-primary-gold" id="open-add-expense-btn" style="width: 100%; padding: 14px; font-size: 0.95rem; justify-content: center;">
              + Add Group Expense
            </button>
          </div>
        </div>

        <!-- Smart "Who Owes Whom" Settlement Matrix -->
        <div style="background: rgba(8,12,20,0.85); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 36px; box-shadow: var(--shadow-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h4 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--text-white);">
                🤝 Smart Debt Settlement Matrix
              </h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                Mathematical net-debt simplification algorithm resolving who owes whom with the minimum number of payments.
              </p>
            </div>
            <button class="btn-outline-glass" id="refresh-settlement-btn" style="padding: 6px 12px; font-size: 0.8rem;">
              🔄 Refresh Matrix
            </button>
          </div>

          ${settlements.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 14px;">
              ${settlements.map(s => `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${s.from?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
                    <div>
                      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-white);">${s.from?.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">owes ${s.to?.name}</div>
                    </div>
                  </div>
                  <strong style="color: var(--gold-light); font-size: 1.1rem; font-family: var(--font-serif);">
                    ₹${Number(s.amount).toLocaleString()}
                  </strong>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
              ✨ All group balances are settled or no shared expenses yet.
            </div>
          `}
        </div>

        <!-- Expense Transactions Table -->
        <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--text-white); margin-bottom: 16px;">
          Expense History (Full CRUD & Soft-Delete Audit)
        </h4>

        ${expenses.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${expenses.map(exp => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; gap: 16px; align-items: center;">
                  <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(212,175,55,0.12); border: 1px solid var(--border-gold); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                    🧾
                  </div>
                  <div>
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 0.72rem; background: rgba(255,255,255,0.06); color: var(--gold-light); font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full);">
                        ${exp.category}
                      </span>
                      <span style="font-size: 0.78rem; color: var(--text-muted);">
                        ${new Date(exp.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-white);">
                      ${exp.description}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                      Paid by <strong style="color: var(--text-white);">${exp.paidBy?.name}</strong> • Split ${exp.splits?.length} ways (₹${(exp.splits?.[0]?.amount || 0).toLocaleString()} each)
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 18px;">
                  <span style="font-family: var(--font-serif); font-size: 1.35rem; font-weight: 700; color: var(--gold-light);">
                    ₹${Number(exp.amount).toLocaleString()}
                  </span>
                  
                  <button class="delete-expense-btn" data-expense-id="${exp.id}" style="background: none; border: 1px solid rgba(244,63,94,0.3); color: #f43f5e; border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer;" title="Soft delete expense">
                    🗑️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 40px 24px; text-align: center; color: var(--text-secondary);">
            No expenses recorded yet.
          </div>
        `}

        <!-- Soft-Deleted Financial Audit Trail -->
        ${deletedExpenses.length > 0 ? `
          <div style="margin-top: 40px; border-top: 1px solid var(--border-subtle); padding-top: 24px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              🛡️ Financial Audit Trail (${deletedExpenses.length} Soft-Deleted Records)
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${deletedExpenses.map(del => `
                <div style="background: rgba(244,63,94,0.04); border: 1px dashed rgba(244,63,94,0.25); border-radius: var(--radius-sm); padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
                  <span style="text-decoration: line-through; color: var(--text-muted);">
                    ${del.description} (₹${del.amount.toLocaleString()})
                  </span>
                  <span style="color: #f43f5e;">
                    Soft-deleted on ${new Date(del.deletedAt).toLocaleDateString()}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `;

      tabMount.querySelector("#open-add-expense-btn")?.addEventListener("click", () => renderAddExpenseModal(trip.id, members));
      tabMount.querySelector("#refresh-settlement-btn")?.addEventListener("click", () => appState.fetchCollabSettlement(trip.id));

      tabMount.querySelectorAll(".delete-expense-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (confirm("Soft-delete this expense? It will be removed from settlement calculations but preserved in the audit log.")) {
            await appState.deleteCollabExpense(trip.id, btn.dataset.expenseId);
          }
        });
      });
    }

    // TAB 5: LIVE CHAT
    else if (activeCollabWorkspaceTab === "chat") {
      tabMount.innerHTML = `
        <div style="background: var(--bg-card); border: 1.5px solid var(--border-gold); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; height: 580px; box-shadow: var(--shadow-lg);">
          <!-- Chat Stream Header -->
          <div style="padding: 16px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: rgba(8,12,20,0.85);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <strong style="color: var(--text-white); font-size: 0.95rem;">Live Squad Chat</strong>
              <span style="font-size: 0.8rem; color: var(--text-muted);">• Real-time SSE Sync</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--gold-light);">${members.length} members connected</span>
          </div>

          <!-- Message History Container -->
          <div id="collab-chat-messages" style="flex-grow: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth;">
            ${messages.length > 0 ? messages.map(msg => {
              const isMine = msg.senderId === currentUser.id;
              const senderMember = members.find(m => m.userId === msg.senderId);
              const isSenderOwner = senderMember?.role === 'OWNER';

              return `
                <div style="display: flex; gap: 12px; align-self: ${isMine ? 'flex-end' : 'flex-start'}; max-width: 80%; flex-direction: ${isMine ? 'row-reverse' : 'row'};">
                  <img src="${msg.sender?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1px solid ${isSenderOwner ? 'var(--gold-primary)' : 'rgba(255,255,255,0.2)'};" />
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; text-align: ${isMine ? 'right' : 'left'};">
                      ${msg.sender?.name} ${isSenderOwner ? '👑' : ''} • ${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style="background: ${isMine ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${isMine ? 'var(--border-gold)' : 'var(--border-subtle)'}; color: var(--text-white); padding: 12px 18px; border-radius: var(--radius-md); font-size: 0.95rem; line-height: 1.5; word-break: break-word;">
                      ${msg.text}
                    </div>
                  </div>
                </div>
              `;
            }).join('') : `
              <div style="margin: auto; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                💬 No messages yet. Say hello to your squad!
              </div>
            `}
          </div>

          <!-- Chat Input Bar -->
          <form id="collab-chat-form" style="padding: 16px 20px; border-top: 1px solid var(--border-subtle); background: rgba(8,12,20,0.95); display: flex; gap: 12px;">
            <input type="text" id="collab-chat-input" placeholder="Type a message to your squad..." style="flex-grow: 1; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-full); padding: 12px 20px; color: #fff; font-size: 0.95rem; outline: none;" autocomplete="off" />
            <button type="submit" class="btn-primary-gold" style="padding: 10px 24px; border-radius: var(--radius-full);">
              Send
            </button>
          </form>
        </div>
      `;

      // Auto scroll chat to bottom
      const chatBox = tabMount.querySelector("#collab-chat-messages");
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

      tabMount.querySelector("#collab-chat-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = tabMount.querySelector("#collab-chat-input");
        const text = input?.value.trim();
        if (text) {
          input.value = "";
          await appState.sendCollabMessage(trip.id, text);
        }
      });
    }

    // -------------------------------------------------------------------------
    // WORKSPACE EVENT LISTENERS
    // -------------------------------------------------------------------------
    container.querySelector("#back-to-hub-btn")?.addEventListener("click", () => {
      appState.closeCollabSSE();
      appState.setCurrentCollabTrip(null);
    });

    container.querySelectorAll(".collab-tab-nav").forEach(btn => {
      btn.addEventListener("click", () => {
        appState.setActiveCollabWorkspaceTab(btn.dataset.tab);
      });
    });

    // Copy Invite Code button
    container.querySelector("#copy-invite-code-btn")?.addEventListener("click", () => {
      navigator.clipboard.writeText(trip.inviteCode);
      appState.showToast("📋 Invite Code copied: " + trip.inviteCode);
    });

    // Copy Co-Owner Code button
    container.querySelector("#copy-coowner-code-btn")?.addEventListener("click", () => {
      navigator.clipboard.writeText(trip.coOwnerInviteCode);
      appState.showToast("👑 Co-Owner Code copied: " + trip.coOwnerInviteCode);
    });

    // Workspace Settings / Manage Squad
    container.querySelector("#workspace-settings-btn")?.addEventListener("click", () => {
      renderManageSquadModal(trip);
    });

    // Leave Trip for Member
    container.querySelector("#workspace-leave-btn")?.addEventListener("click", async () => {
      if (confirm("Are you sure you want to leave this collaborative trip?")) {
        await appState.leaveCollabTrip(trip.id);
      }
    });
  };

  // Event delegation on container for robust button handling
  container.addEventListener("click", (e) => {
    const createBtn = e.target.closest("#open-create-trip-modal-btn, #empty-create-trip-btn");
    if (createBtn) {
      e.preventDefault();
      e.stopPropagation();
      renderCreateTripModal();
      return;
    }

    const joinBtn = e.target.closest("#open-join-trip-modal-btn, #empty-join-trip-btn");
    if (joinBtn) {
      e.preventDefault();
      e.stopPropagation();
      renderJoinTripModal();
      return;
    }

    const tripCard = e.target.closest(".collab-trip-card");
    if (tripCard) {
      const tripId = tripCard.dataset.tripId;
      if (tripId) appState.fetchCollabTripDetails(tripId);
      return;
    }

    const backBtn = e.target.closest("#back-to-hub-btn");
    if (backBtn) {
      e.preventDefault();
      appState.closeCollabSSE();
      appState.setCurrentCollabTrip(null);
      return;
    }
  });

  // Subscribe to state updates
  appState.subscribe(render);

  // Initial load: restore active trip details if present, or fetch trips list
  setTimeout(() => {
    const state = appState.getState();
    const activeTripId = state.currentCollabTrip?.id || localStorage.getItem("auricvyom_active_collab_trip_id");
    if (activeTripId) {
      appState.fetchCollabTripDetails(activeTripId);
    } else {
      appState.fetchCollabTrips();
    }
  }, 0);

  return container;
}

// =============================================================================
// MODAL 1: CREATE COLLABORATIVE TRIP MODAL
// =============================================================================
function renderCreateTripModal() {
  document.querySelectorAll("#create-collab-trip-modal").forEach(el => el.remove());
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";
  modal.id = "create-collab-trip-modal";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 14);

  const startIso = tomorrow.toISOString().split('T')[0];
  const endIso = nextWeek.toISOString().split('T')[0];

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 620px; padding: 32px;" id="create-trip-modal-window">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--text-white);">
          Create Collaborative Trip
        </h3>
        <button id="close-create-trip-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <form id="create-collab-trip-form" style="display: flex; flex-direction: column; gap: 18px;">
        <div>
          <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
            Trip Name *
          </label>
          <input type="text" id="trip-name-input" required placeholder="e.g. Royal Rajasthan Heritage Escape" 
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px; color: #fff; font-size: 0.95rem;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
              Destination *
            </label>
            <select id="trip-destination-select" required style="width: 100%; background: #080c14; border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px; color: #fff; font-size: 0.95rem;">
              ${DESTINATIONS.map(d => `
                <option value="${d.name}">${d.name} (${d.state})</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
              Number of Travellers *
            </label>
            <input type="number" id="trip-travelers-input" min="1" max="25" value="4" required
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px; color: #fff; font-size: 0.95rem;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
              Start Date *
            </label>
            <input type="date" id="trip-start-date" value="${startIso}" required
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px; color: #fff; font-size: 0.95rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
              End Date *
            </label>
            <input type="date" id="trip-end-date" value="${endIso}" required
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px; color: #fff; font-size: 0.95rem;" />
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
            Target Shared Budget (₹ INR)
          </label>
          <input type="number" id="trip-budget-input" placeholder="e.g. 150000" min="0" step="5000"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; color: #fff; font-size: 0.95rem;" />
        </div>

        <!-- 2 Co-Owners Invariant Box -->
        <div style="background: rgba(212,175,55,0.08); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 16px;">
          <label style="display: block; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">
            👑 Designate 2nd Co-Owner (Email or Invite Code)
          </label>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 8px;">
            AuricVyom trips maintain exactly 2 co-owners. Enter your partner's email, or a dedicated 2nd Co-Owner invite code will be created.
          </p>
          <input type="email" id="trip-coowner-email" placeholder="co-owner@example.com (optional)"
                 style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff; font-size: 0.9rem;" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
          <button type="button" id="cancel-create-trip-btn" class="btn-outline-glass" style="padding: 10px 20px;">
            Cancel
          </button>
          <button type="submit" class="btn-primary-gold" style="padding: 10px 28px;">
            ✨ Create Trip & Generate Code
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-create-trip-modal")?.addEventListener("click", close);
  modal.querySelector("#cancel-create-trip-btn")?.addEventListener("click", close);

  modal.querySelector("#create-collab-trip-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector("#trip-name-input")?.value?.trim();
    const destination = form.querySelector("#trip-destination-select")?.value?.trim();
    const travelersCount = Number(form.querySelector("#trip-travelers-input")?.value || 1);
    const startDate = form.querySelector("#trip-start-date")?.value;
    const endDate = form.querySelector("#trip-end-date")?.value;
    const targetBudget = form.querySelector("#trip-budget-input")?.value;
    const coOwnerEmail = form.querySelector("#trip-coowner-email")?.value?.trim();

    if (!name) {
      appState.showToast("Please enter a trip name");
      return;
    }
    if (!destination) {
      appState.showToast("Please select a destination");
      return;
    }
    if (!startDate || !endDate) {
      appState.showToast("Please select valid start and end dates");
      return;
    }

    const res = await appState.createCollabTrip({
      name,
      destination,
      travelersCount,
      startDate,
      endDate,
      targetBudget: targetBudget ? Number(targetBudget) : null,
      coOwnerEmail: coOwnerEmail || null
    });

    if (res) {
      close();
      if (res.id) {
        appState.fetchCollabTripDetails(res.id);
      }
    }
  });
}

// =============================================================================
// MODAL 2: JOIN TRIP VIA INVITE CODE
// =============================================================================
function renderJoinTripModal() {
  document.querySelectorAll("#join-collab-trip-modal").forEach(el => el.remove());
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";
  modal.id = "join-collab-trip-modal";

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 500px; padding: 32px;" id="join-trip-modal-window">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-white);">
          🔑 Join Collaborative Journey
        </h3>
        <button id="close-join-trip-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
        Enter the 8-character invite code provided by your trip co-owners (e.g. <code>VYOM-XXXX</code> or <code>CO-XXXX</code>).
      </p>

      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <input type="text" id="join-invite-code-input" placeholder="VYOM-XXXX" maxlength="12"
               style="flex-grow: 1; text-transform: uppercase; font-family: monospace; font-size: 1.1rem; font-weight: 700; background: rgba(255,255,255,0.06); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px 16px; color: var(--gold-light); outline: none;" />
        <button id="preview-code-btn" class="btn-outline-glass" style="padding: 10px 18px;">
          Preview
        </button>
      </div>

      <!-- Preview Card Mount -->
      <div id="join-preview-mount" style="min-height: 20px; margin-bottom: 20px;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button id="cancel-join-modal-btn" class="btn-outline-glass" style="padding: 10px 20px;">
          Cancel
        </button>
        <button id="confirm-join-trip-btn" class="btn-primary-gold" style="padding: 10px 28px;">
          Join Trip Now
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-join-trip-modal")?.addEventListener("click", close);
  modal.querySelector("#cancel-join-modal-btn")?.addEventListener("click", close);

  const previewMount = modal.querySelector("#join-preview-mount");
  const codeInput = modal.querySelector("#join-invite-code-input");

  modal.querySelector("#preview-code-btn")?.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) return;
    if (previewMount) previewMount.innerHTML = `<div style="color: var(--gold-light); font-size: 0.85rem;">Checking code...</div>`;
    const res = await appState.previewInviteCode(code);
    if (res.success && previewMount) {
      const d = res.data;
      previewMount.innerHTML = `
        <div style="background: rgba(8,12,20,0.85); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 16px;">
          <div style="font-size: 0.75rem; color: ${d.isCoOwnerCode ? 'var(--gold-primary)' : 'var(--text-muted)'}; font-weight: 700; text-transform: uppercase;">
            ${d.isCoOwnerCode ? '👑 2nd Co-Owner Invite Slot' : '👥 Member Invite'}
          </div>
          <div style="font-family: var(--font-serif); font-size: 1.2rem; color: #fff; margin: 4px 0;">${d.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">📍 ${d.destination} • ${d.durationDays} Days (${d.memberCount} members)</div>
        </div>
      `;
    } else if (previewMount) {
      previewMount.innerHTML = `<div style="color: #f43f5e; font-size: 0.85rem;">❌ Invalid or expired invite code</div>`;
    }
  });

  modal.querySelector("#confirm-join-trip-btn")?.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) return;
    const res = await appState.joinCollabTrip(code);
    if (res) {
      close();
    }
  });
}

// =============================================================================
// MODAL 3: ADD ITINERARY ITEM MODAL
// =============================================================================
function renderAddItineraryModal(tripId, defaultDay = 1, prefill = null) {
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 550px; padding: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white);">
          Add Itinerary Activity
        </h3>
        <button id="close-itinerary-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <form id="add-itinerary-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Day Number</label>
            <input type="number" id="itin-day" min="1" max="60" value="${defaultDay}" required
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Category</label>
            <select id="itin-category" style="width: 100%; background: #080c14; border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff;">
              <option value="SIGHTSEEING" ${prefill?.category === 'SIGHTSEEING' ? 'selected' : ''}>🏛️ Sightseeing</option>
              <option value="DINING" ${prefill?.category === 'DINING' || prefill?.category === 'Fine Dining' ? 'selected' : ''}>🍽️ Dining</option>
              <option value="ACTIVITY" selected>🧗 Activity / Experience</option>
              <option value="STAY">🏨 Stay / Check-in</option>
              <option value="TRAVEL">🚗 Transport / Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Activity Title *</label>
          <input type="text" id="itin-title" value="${prefill?.title || ''}" required placeholder="e.g. Sunrise Hot Air Balloon Safari"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Location</label>
          <input type="text" id="itin-location" placeholder="e.g. Amer Fort Valley, Jaipur"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Start Time</label>
            <input type="time" id="itin-start-time" value="10:00"
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">End Time</label>
            <input type="time" id="itin-end-time" value="12:30"
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Est. Cost (₹)</label>
            <input type="number" id="itin-cost" placeholder="0" min="0" step="100"
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Description / Notes</label>
          <textarea id="itin-desc" rows="2" placeholder="Wear comfortable shoes, carry cameras..."
                    style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
          <button type="button" id="cancel-itin-btn" class="btn-outline-glass" style="padding: 8px 18px;">Cancel</button>
          <button type="submit" class="btn-primary-gold" style="padding: 8px 24px;">+ Add to Itinerary</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-itinerary-modal")?.addEventListener("click", close);
  modal.querySelector("#cancel-itin-btn")?.addEventListener("click", close);

  modal.querySelector("#add-itinerary-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const dayNumber = Number(form.querySelector("#itin-day")?.value || 1);
    const category = form.querySelector("#itin-category")?.value;
    const title = form.querySelector("#itin-title")?.value?.trim();
    const location = form.querySelector("#itin-location")?.value?.trim();
    const startTime = form.querySelector("#itin-start-time")?.value;
    const endTime = form.querySelector("#itin-end-time")?.value;
    const cost = form.querySelector("#itin-cost")?.value;
    const description = form.querySelector("#itin-desc")?.value?.trim();

    const res = await appState.addCollabItineraryItem(tripId, {
      dayNumber,
      category,
      title,
      location,
      startTime,
      endTime,
      cost: cost ? Number(cost) : null,
      description
    });

    if (res) close();
  });
}

// =============================================================================
// MODAL 4: PIN NEW SAVED PLACE MODAL
// =============================================================================
function renderAddPlaceModal(tripId) {
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 500px; padding: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white);">
          Pin Saved Spot
        </h3>
        <button id="close-place-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <form id="add-place-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Spot Name *</label>
          <input type="text" id="place-name" required placeholder="e.g. Baradari Dining at City Palace"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Category</label>
            <select id="place-category" style="width: 100%; background: #080c14; border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff;">
              <option value="Heritage Monument">🏛️ Heritage Monument</option>
              <option value="Fine Dining">🍽️ Fine Dining / Cafe</option>
              <option value="Scenic Viewpoint">🌄 Scenic Viewpoint</option>
              <option value="Boutique Stay">🏨 Boutique Stay</option>
              <option value="Shopping & Craft">🛍️ Shopping & Craft</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Rating (out of 5)</label>
            <input type="number" id="place-rating" step="0.1" min="1" max="5" value="4.8"
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Address / Landmark</label>
          <input type="text" id="place-address" placeholder="e.g. Jalebi Chowk, City Palace, Jaipur"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Notes for Squad</label>
          <textarea id="place-notes" rows="2" placeholder="Recommended for sunset cocktails and royal thali..."
                    style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
          <button type="button" id="cancel-place-btn" class="btn-outline-glass" style="padding: 8px 18px;">Cancel</button>
          <button type="submit" class="btn-primary-gold" style="padding: 8px 24px;">+ Pin Spot</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-place-modal")?.addEventListener("click", close);
  modal.querySelector("#cancel-place-btn")?.addEventListener("click", close);

  modal.querySelector("#add-place-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector("#place-name")?.value?.trim();
    const category = form.querySelector("#place-category")?.value;
    const rating = Number(form.querySelector("#place-rating")?.value || 5);
    const address = form.querySelector("#place-address")?.value?.trim();
    const notes = form.querySelector("#place-notes")?.value?.trim();

    const res = await appState.addCollabSavedPlace(tripId, {
      name,
      category,
      rating,
      address,
      notes
    });

    if (res) close();
  });
}

// =============================================================================
// MODAL 5: CREATE SQUAD POLL (OWNERS ONLY)
// =============================================================================
function renderCreatePollModal(tripId) {
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 520px; padding: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white);">
          📊 Create Decision Poll
        </h3>
        <button id="close-poll-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <form id="create-poll-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Question *</label>
          <input type="text" id="poll-question" required placeholder="e.g. Which palace should we visit first?"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Options (At least 2 required)</label>
          <div id="poll-options-inputs" style="display: flex; flex-direction: column; gap: 8px;">
            <input type="text" class="poll-option-input" required placeholder="Option 1 (e.g. City Palace Museum)"
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
            <input type="text" class="poll-option-input" required placeholder="Option 2 (e.g. Amer Fort & Light Show)"
                   style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
          </div>
          <button type="button" id="add-more-option-btn" style="margin-top: 8px; background: none; border: none; color: var(--gold-light); font-size: 0.82rem; cursor: pointer;">
            + Add Another Option
          </button>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px;">
          <button type="button" id="cancel-poll-btn" class="btn-outline-glass" style="padding: 8px 18px;">Cancel</button>
          <button type="submit" class="btn-primary-gold" style="padding: 8px 24px;">Launch Poll</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-poll-modal")?.addEventListener("click", close);
  modal.querySelector("#cancel-poll-btn")?.addEventListener("click", close);

  modal.querySelector("#add-more-option-btn")?.addEventListener("click", () => {
    const wrap = modal.querySelector("#poll-options-inputs");
    if (!wrap) return;
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "poll-option-input";
    inp.placeholder = `Option ${wrap.children.length + 1}`;
    inp.style.cssText = "width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;";
    wrap.appendChild(inp);
  });

  modal.querySelector("#create-poll-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const question = form.querySelector("#poll-question")?.value?.trim();
    const optionInputs = modal.querySelectorAll(".poll-option-input");
    const options = Array.from(optionInputs).map(inp => inp.value.trim()).filter(Boolean);

    if (options.length < 2) {
      alert("At least two options are required");
      return;
    }

    const res = await appState.createCollabPoll(tripId, { question, options });
    if (res) close();
  });
}

// =============================================================================
// MODAL 6: ADD GROUP EXPENSE MODAL
// =============================================================================
function renderAddExpenseModal(tripId, members = []) {
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 520px; padding: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-white);">
          Record Group Expense
        </h3>
        <button id="close-expense-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <form id="add-expense-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Total Amount (₹ INR) *</label>
            <input type="number" id="exp-amount" min="1" step="1" required placeholder="e.g. 15000"
                   style="width: 100%; font-size: 1.1rem; font-weight: 700; background: rgba(255,255,255,0.06); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: var(--gold-light);" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Category</label>
            <select id="exp-category" style="width: 100%; background: #080c14; border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px 8px; color: #fff;">
              <option value="Stay">🏨 Stay</option>
              <option value="Dining">🍽️ Dining</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Activities">🧗 Activities</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="General" selected>🧾 General</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">Description *</label>
          <input type="text" id="exp-desc" required placeholder="e.g. Heritage Haveli 2-Night Stay Deposit"
                 style="width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: #fff;" />
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">Split Between Squad Members</label>
          <div style="background: rgba(8,12,20,0.85); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px;">
            ${members.map(m => `
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: #fff; cursor: pointer;">
                <input type="checkbox" class="exp-member-split" value="${m.userId}" checked />
                <span>${m.user?.name} (${m.role === 'OWNER' ? '👑 Co-Owner' : 'Member'})</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
          <button type="button" id="cancel-exp-btn" class="btn-outline-glass" style="padding: 8px 18px;">Cancel</button>
          <button type="submit" class="btn-primary-gold" style="padding: 8px 24px;">Record & Split</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-expense-modal")?.addEventListener("click", close);
  modal.querySelector("#cancel-exp-btn")?.addEventListener("click", close);

  modal.querySelector("#add-expense-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const amount = Number(form.querySelector("#exp-amount")?.value || 0);
    const category = form.querySelector("#exp-category")?.value;
    const description = form.querySelector("#exp-desc")?.value?.trim();
    const checked = modal.querySelectorAll(".exp-member-split:checked");
    const splitBetweenMemberIds = Array.from(checked).map(c => c.value);

    const res = await appState.createCollabExpense(tripId, {
      amount,
      category,
      description,
      splitBetweenMemberIds
    });

    if (res) close();
  });
}

// =============================================================================
// MODAL 7: MANAGE SQUAD & TWO CO-OWNERS INVARIANT TRANSFER
// =============================================================================
function renderManageSquadModal(trip) {
  const modal = document.createElement("div");
  modal.className = "auric-modal-backdrop modal-overlay-backdrop active";

  const members = trip.members || [];
  const currentUserId = appState.getState().currentUser?.id;
  const isCallerOwner = trip.userRole === 'OWNER';
  const otherMembers = members.filter(m => m.userId !== currentUserId && m.role === 'MEMBER');

  modal.innerHTML = `
    <div class="modal-window-container" style="max-width: 580px; padding: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-white);">
          ⚙️ Squad & Ownership Controls
        </h3>
        <button id="close-squad-modal" style="background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;">✕</button>
      </div>

      <!-- Invariant Banner -->
      <div style="background: rgba(212,175,55,0.08); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 24px;">
        <div style="color: var(--gold-light); font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">
          👑 Two Co-Owners Invariant
        </div>
        <p style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5;">
          Every AuricVyom trip maintains exactly two co-owners. Co-owners have authority to edit trips, invite/remove members, and launch polls. Co-ownership can be atomically transferred to any member.
        </p>
      </div>

      <!-- Member Roster -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 0.8rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">
          Current Squad Roster (${members.length})
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${members.map(m => {
            const isOwner = m.role === 'OWNER';
            return `
              <div style="background: rgba(8,12,20,0.85); border: 1px solid ${isOwner ? 'var(--border-gold)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${m.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
                  <div>
                    <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">${m.user?.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${m.user?.email}</div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: ${isOwner ? 'var(--gold-light)' : 'var(--text-muted)'};">
                    ${isOwner ? '👑 Co-Owner' : 'Member'}
                  </span>

                  ${isCallerOwner && !isOwner ? `
                    <button class="remove-squad-member-btn" data-user-id="${m.userId}" data-user-name="${m.user?.name}" style="background: none; border: 1px solid rgba(244,63,94,0.3); color: #f43f5e; border-radius: var(--radius-sm); padding: 4px 8px; font-size: 0.75rem; cursor: pointer;">
                      Remove
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Atomic Ownership Transfer Action -->
      ${isCallerOwner ? `
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 20px;">
          <div style="font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">
            Transfer Your Co-Ownership
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
            Select a squad member to promote to Co-Owner. You will become a regular Member, preserving the 2 co-owners count.
          </p>
          
          ${otherMembers.length > 0 ? `
            <div style="display: flex; gap: 10px;">
              <select id="transfer-target-user-select" style="flex-grow: 1; background: #080c14; border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 10px; color: #fff; font-size: 0.9rem;">
                ${otherMembers.map(m => `
                  <option value="${m.userId}">${m.user?.name} (${m.user?.email})</option>
                `).join('')}
              </select>
              <button id="confirm-transfer-btn" class="btn-primary-gold" style="padding: 10px 20px; font-size: 0.88rem;">
                Transfer
              </button>
            </div>
          ` : `
            <p style="font-size: 0.82rem; color: var(--text-muted); font-style: italic;">
              No other members in the trip yet. Invite members using the invite code to transfer ownership.
            </p>
          `}
        </div>
      ` : ''}

      <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
        <button id="close-squad-done-btn" class="btn-outline-glass" style="padding: 10px 24px;">
          Done
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector("#close-squad-modal")?.addEventListener("click", close);
  modal.querySelector("#close-squad-done-btn")?.addEventListener("click", close);

  modal.querySelectorAll(".remove-squad-member-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uId = btn.dataset.userId;
      const uName = btn.dataset.userName;
      if (confirm(`Remove ${uName} from the collaborative trip?`)) {
        const ok = await appState.removeCollabMember(trip.id, uId);
        if (ok) close();
      }
    });
  });

  modal.querySelector("#confirm-transfer-btn")?.addEventListener("click", async () => {
    const sel = modal.querySelector("#transfer-target-user-select");
    if (!sel) return;
    const targetUserId = sel.value;
    if (confirm("Are you sure? You will step down to Member and the selected user will become Co-Owner.")) {
      const ok = await appState.transferCollabOwnership(trip.id, targetUserId);
      if (ok) close();
    }
  });
}
