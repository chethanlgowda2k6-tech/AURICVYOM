// AURICVYOM User Authentication Modal Dialog Component
// Mounts the shared luxury AuthView component seamlessly inside a modal window
import { appState } from "../state.js";
import { renderAuthView } from "./AuthView.js";

export function renderAuthModal() {
  const backdrop = document.createElement("div");
  backdrop.className = "auric-modal-backdrop auth-modal-backdrop";
  backdrop.id = "auth-modal-backdrop";

  const renderContent = () => {
    const { activeModal, authMode } = appState.getState();
    if (activeModal !== "authModal") {
      backdrop.classList.remove("active");
      backdrop.innerHTML = "";
      return;
    }

    backdrop.innerHTML = `
      <div class="modal-window-container auth-modal-window" id="auth-modal-window">
        <button class="modal-close-btn" id="auth-modal-close-x" aria-label="Close Authentication">✕</button>
        <div id="auth-modal-mount-point"></div>
      </div>
    `;

    const mountPoint = backdrop.querySelector("#auth-modal-mount-point");
    if (mountPoint) {
      mountPoint.appendChild(renderAuthView(authMode || "login"));
    }

    backdrop.classList.add("active");

    backdrop.querySelector("#auth-modal-close-x")?.addEventListener("click", () => {
      appState.closeModal();
    });
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) appState.closeModal();
  });

  appState.subscribe(() => {
    renderContent();
  });

  return backdrop;
}
