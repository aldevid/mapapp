export function setupMapListUI() {
  const sidebar = document.getElementById("sidebar");
  window.openSidebar = () => {
    sidebar.classList.remove("hidden");
  };

  // Myマップの開閉
  const toggle = document.getElementById('my-map-toggle');
  const list = document.getElementById('my-map-list');

  toggle?.addEventListener('click', () => {
    const isVisible = list.style.display === 'block';
    list.style.display = isVisible ? 'none' : 'block';
    toggle.innerText = isVisible ? 'Myマップ ▾' : 'Myマップ ▴';
  });

  // マップ作成フォームの開閉
  document.getElementById('show-create-map-form')?.addEventListener('click', () => {
    const form = document.getElementById('create-map-form');
    form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
  });

  // マップ作成実行
  document.getElementById('submit-new-map')?.addEventListener('click', () => {
    const name = document.getElementById('new-map-name').value;
    if (!name.trim()) {
      alert('マップ名を入力してください');
      return;
    }

    fetch("/map/create/ajax/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      },
      body: `name=${encodeURIComponent(name)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        window.location.href = `/map/${data.map_id}/`;
      } else {
        alert('マップの作成に失敗しました。');
      }
    })
    .catch(() => {
      alert('通信エラーが発生しました。');
    });
  });

  // おすすめ設定保存ボタン
  document.getElementById('save-map-settings')?.addEventListener('click', () => {
    if (!MAP_ID) {
      alert("マップIDが取得できません。");
      return;
    }

    const data = {
      is_recommended: document.getElementById('is-recommended')?.checked,
      genre: document.getElementById('map-genre')?.value,
      description: document.getElementById('map-description')?.value
    };

    fetch(`/map/${MAP_ID}/update_settings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        if (result.status === 'ok') {
          alert("マップ設定を保存しました！");
        } else {
          alert("保存に失敗しました。");
        }
      });
  });

  // 絞り込み関数
  function filterRecommendMaps() {
    const keyword = document.getElementById('map-search-input')?.value.toLowerCase() || '';
    const genre = document.getElementById('genre-filter')?.value || '';
    const cards = document.querySelectorAll('.recommend-card');
    cards.forEach(card => {
      const name = card.dataset.name?.toLowerCase() || '';
      const cardGenre = card.dataset.genre || '';
      const matchName = name.includes(keyword);
      const matchGenre = genre === "" || genre === cardGenre;
      card.style.display = (matchName && matchGenre) ? "block" : "none";
    });
  }

  // イベント登録
  document.getElementById('map-search-input')?.addEventListener('input', filterRecommendMaps);
  document.getElementById('genre-filter')?.addEventListener('change', filterRecommendMaps);

  // おすすめマップトグル
  document.getElementById('recommend-toggle')?.addEventListener('click', () => {
    const list = document.getElementById('recommend-list');
    const toggle = document.getElementById('recommend-toggle');
    const settings = document.getElementById('map-settings');

    const isVisible = window.getComputedStyle(list).display !== 'none';

    if (!isVisible) {
      list.style.display = 'block';
      toggle.textContent = 'おすすめマップ';

      if (settings.style.display === 'block') {
        settings.style.display = 'none';
        document.getElementById('settings-toggle').textContent = '👍';
      }

      // データ取得＆描画
      fetch('/map/recommendations/json/')
        .then(res => res.json())
        .then(data => {
          const container = document.getElementById('recommend-content');
          if (!container) return;

          if (!data.maps.length) {
            container.innerHTML = '<p>おすすめマップはまだありません。</p>';
            return;
          }

          const html = data.maps.map(m => `
            <div class="recommend-card" data-name="${m.name}" data-genre="${m.genre}" style="position: relative; margin-bottom: 10px; padding: 6px; border-bottom: 1px solid #eee;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <strong>${m.name}</strong><br>
                  <small>ジャンル: ${m.genre || 'なし'}</small><br>
                  <small>作成者: ${m.user}</small><br>
                  <a href="/map/${m.id}/">▶ このマップを見る</a>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                  <button class="like-button"
                          data-id="${m.id}"
                          data-liked="${m.is_liked}"
                          style="background: none; border: none; cursor: pointer;">
                    👍 <span>${m.likes}</span>
                  </button>
                  <button class="fav-button"
                          data-id="${m.id}"
                          data-favorited="${m.is_favorite}"
                          style="background: none; border: none; cursor: pointer;">
                    ${m.is_favorite ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            </div>
          `).join('');
          

          container.innerHTML = html;

          filterRecommendMaps(); // 初期絞り込み

          // いいね処理
          // ✅ いいねボタン処理（toggle対応版）
          // いいね
         // いいねボタン処理
          container.querySelectorAll('.like-button').forEach(btn => {
            btn.addEventListener('click', () => {
              const mapId = btn.dataset.id;
              const countSpan = btn.querySelector('span');          
              fetch(`/map/${mapId}/like/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': CSRF_TOKEN }
              })
              .then(res => res.json())
              .then(data => {
                if (data.status === 'liked') {
                  btn.dataset.liked = 'true';
                  countSpan.textContent = data.count;
                } else if (data.status === 'removed') {
                  btn.dataset.liked = 'false';
                  countSpan.textContent = data.count;
                }
              });
            });
          });
          
          container.querySelectorAll('.fav-button').forEach(btn => {
            btn.addEventListener('click', () => {
              const mapId = btn.dataset.id;
          
              fetch(`/map/${mapId}/favorite/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': CSRF_TOKEN }
              })
              .then(res => res.json())
              .then(data => {
                if (data.status === 'added') {
                  btn.dataset.favorited = 'true';
                  btn.textContent = '❤️';
          
                  // ✅ 追加処理ここから
                const mapCardWrapper = document.createElement('div');
                mapCardWrapper.className = 'map-card-wrapper';
                mapCardWrapper.dataset.mapId = mapId;                
                // 🧩 headerラッパー追加（横並び）
                const header = document.createElement('div');
                header.className = 'map-card-header';                
                const link = document.createElement('a');
                link.href = `/map/${mapId}/`;
                link.className = 'map-card';
                link.textContent = btn.closest('.recommend-card').dataset.name;                
                const unfavBtn = document.createElement('button');
                unfavBtn.className = 'unfavorite-map-btn';
                unfavBtn.dataset.mapId = mapId;
                unfavBtn.textContent = '🤍';                
                // お気に入り解除クリック処理
                unfavBtn.addEventListener('click', () => {
                  fetch(`/map/${mapId}/favorite/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': CSRF_TOKEN }
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.status === 'removed') {
                      mapCardWrapper.remove();                
                      // おすすめマップ側のハートも更新
                      const recBtn = document.querySelector(`.recommend-card button.fav-button[data-id="${mapId}"]`);
                      if (recBtn) {
                        recBtn.dataset.favorited = "false";
                        recBtn.textContent = "🤍";
                      }
                    }
                  });
                });                
                header.appendChild(link);
                header.appendChild(unfavBtn);
                mapCardWrapper.appendChild(header);                
                document.querySelector('#my-map-list').appendChild(mapCardWrapper);
                // ✅ 追加処理ここまで                
                  // ✅ 追加処理ここまで
                } else if (data.status === 'removed') {
                  btn.dataset.favorited = 'false';
                  btn.textContent = '🤍';

                  const targetInMyMap = document.querySelector(`#my-map-list .map-card-wrapper[data-map-id="${mapId}"]`);
                  if (targetInMyMap) {
                    targetInMyMap.remove(); // Myマップ一覧からも削除
                  }
                }
              });
            });
          });
                     
        });
    } else {
      list.style.display = 'none';
      toggle.textContent = 'おすすめマップ';
    }
  });





  // マップ設定の開閉
  document.getElementById('settings-toggle')?.addEventListener('click', () => {
    const settings = document.getElementById('map-settings');
    const recommend = document.getElementById('recommend-list');
    const toggle = document.getElementById('settings-toggle');

    const isVisible = settings.style.display === 'block';
    settings.style.display = isVisible ? 'none' : 'block';
    toggle.textContent = '👍';

    if (!isVisible && recommend.style.display === 'block') {
      recommend.style.display = 'none';
      document.getElementById('recommend-toggle').textContent = 'おすすめマップ';
    }
  });

  // サイドバーの閉じる
  const closeBtn = document.getElementById("close-sidebar-btn");
  closeBtn?.addEventListener("click", () => {
    sidebar.classList.add("hidden");
  });
}
