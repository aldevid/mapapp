import { initMap, loadSpots } from './mapCore.js';
import { setupMapListUI } from './mapList.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM loaded");

  initMap();
  loadSpots();
  setupMapListUI();

  const userIcon = document.getElementById('user-icon-button');
  const overlay = document.getElementById('user-menu-overlay');

  // 💡 念のため、初期状態で hidden を明示的に付け直す
  if (overlay && !overlay.classList.contains('hidden')) {
    console.warn("⚠️ overlay was visible on load. Hiding it.");
    overlay.classList.add('hidden');
  }

  if (userIcon && overlay) {
    userIcon.addEventListener('click', () => {
      console.log("👆 userIcon clicked");
      overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        console.log("💨 overlay clicked, hiding...");
        overlay.classList.add('hidden');
      }
    });
  } else {
    console.warn("❌ userIcon or overlay not found");
  }

  const closeUserMenuBtn = document.getElementById('close-user-menu-btn');
  if (closeUserMenuBtn && overlay) {
    closeUserMenuBtn.addEventListener('click', () => {
      console.log("❌ close button clicked");
      overlay.classList.add('hidden');
    });
  }

});
