import { initMap, loadSpots } from './mapCore.js';
import { setupMapListUI } from './mapList.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM loaded");

  initMap();
  loadSpots();
  setupMapListUI();


    // mymap delete function--------------------------------------------------------
  let deleteMode = false;
  
  document.getElementById("delete-map-mode-toggle")?.addEventListener("click", () => {
    deleteMode = !deleteMode;
  
    document.querySelectorAll(".delete-map-btn").forEach(btn => {
      btn.style.display = deleteMode ? "inline-block" : "none";
    });
  
    document.getElementById("delete-map-mode-toggle").textContent = 
      deleteMode ? "削除モード終了" : "マップを削除";
  });
  
  // 各削除ボタンに削除処理を追加
  document.querySelectorAll(".delete-map-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const mapId = btn.closest(".map-card-wrapper").dataset.mapId;
      if (confirm("本当にこのマップを削除しますか？")) {
        fetch(`/map/${mapId}/delete/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": CSRF_TOKEN
          }
        })
        .then(res => {
          if (res.ok) {
            btn.closest(".map-card-wrapper").remove();
          } else {
            alert("削除に失敗しました。");
          }
        });
      }
    });
  });
    // 🤍 お気に入り解除ボタン処理
    document.querySelectorAll(".unfavorite-map-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mapId = btn.dataset.mapId;
        fetch(`/map/${mapId}/favorite/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": CSRF_TOKEN
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.status === "removed") {
            btn.closest(".map-card-wrapper").remove();  // お気に入り解除したらUIからも削除

            const recButton =document.querySelector(
              `.recommend-card button.fav-button[data-id="${mapId}"]`
            );
            if (recButton) {
              recButton.dataset.favirited = "false";
              recButton.textContent = "🤍";
            }
          }
        });
      });
    });


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
    
        // ✅ 背景クリック時もメッセージ削除
        const messageList = document.getElementById('user-message-list');
        if (messageList) {
          messageList.remove();
        }
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
  
      // ✅ ポップを閉じたらメッセージを消す！
      const messageList = document.getElementById('user-message-list');
      if (messageList) {
        messageList.remove();  // または messageList.innerHTML = "";
      }
    });
  }  

});


