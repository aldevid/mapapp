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
  
  
  // おすすめマップ search function------------------------------------------------------------
// ✅ 絞り込み関数を「先に定義」する（外に出す！）
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

// ✅ イベント登録（絞り込み機能）
document.getElementById('map-search-input')?.addEventListener('input', filterRecommendMaps);
document.getElementById('genre-filter')?.addEventListener('change', filterRecommendMaps);

// ✅ おすすめマップトグルイベント
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

    // ✅ データ読み込みとDOM生成
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
          <div class="recommend-card" data-name="${m.name}" data-genre="${m.genre}" style="margin-bottom: 10px; padding: 6px; border-bottom: 1px solid #eee;">
            <strong>${m.name}</strong><br>
            <small>ジャンル: ${m.genre || 'なし'}</small><br>
            <small>作成者: ${m.user}</small><br>
            <a href="/map/${m.id}/">▶ このマップを見る</a>
          </div>
        `).join('');

        container.innerHTML = html;

        // ✅ 絞り込み反映
        filterRecommendMaps();
      });
  } else {
    list.style.display = 'none';
    toggle.textContent = 'おすすめマップ';
  }
});


  // ----------------------------------------------------------------------------------------
  
  // ⚙️ マップ設定の開閉
  document.getElementById('settings-toggle')?.addEventListener('click', () => {
    const settings = document.getElementById('map-settings');
    const recommend = document.getElementById('recommend-list');
    const toggle = document.getElementById('settings-toggle');
  
    const isVisible = settings.style.display === 'block';
    settings.style.display = isVisible ? 'none' : 'block';
    toggle.textContent = isVisible ? '👍' : '👍';
  
    // おすすめマップ一覧が開いてたら閉じる
    if (!isVisible && recommend.style.display === 'block') {
      recommend.style.display = 'none';
      document.getElementById('recommend-toggle').textContent = 'おすすめマップ';
    }
  });

    // サイドバーの開閉（×ボタン）
    const closeBtn = document.getElementById("close-sidebar-btn");
  
    closeBtn?.addEventListener("click", () => {
      sidebar.classList.add("hidden");
    });
    
    // グローバルに公開：ピンから呼び出すため

  
}
