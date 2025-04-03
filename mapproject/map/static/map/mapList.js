export function setupMapListUI() {
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

  document.getElementById('recommend-toggle')?.addEventListener('click', () => {
    const list = document.getElementById('recommend-list');
    const toggle = document.getElementById('recommend-toggle');
    const settings = document.getElementById('map-settings');
  
    const isVisible = window.getComputedStyle(list).display !== 'none';

  
    if (!isVisible) {
      const rect = toggle.getBoundingClientRect();
      list.style.display = 'block';
      toggle.textContent = 'おすすめマップ';
  
      // 👇マップ設定が開いてたら閉じる
      if (settings.style.display === 'block') {
        settings.style.display = 'none';
        document.getElementById('settings-toggle').textContent = '👍';
      }
  
      // データ読み込み
      fetch('/map/recommendations/json/')
        .then(res => res.json())
        .then(data => {
          const html = data.maps.map(m => `
            <div style="margin-bottom: 10px; padding: 6px; border-bottom: 1px solid #eee;">
              <strong>${m.name}</strong><br>
              <small>ジャンル: ${m.genre || 'なし'}</small><br>
              <a href="/map/${m.id}/">▶ このマップを見る</a>
            </div>
          `).join('');
          document.getElementById('recommend-content').innerHTML = html || '<p>おすすめマップはまだありません。</p>';
        });
  
    } else {
      list.style.display = 'none';
      toggle.textContent = 'おすすめマップ';
    }
  });

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
    const sidebar = document.getElementById("sidebar");
    const closeBtn = document.getElementById("close-sidebar-btn");
  
    closeBtn?.addEventListener("click", () => {
      sidebar.classList.add("hidden");
    });
  
    // グローバルに公開：ピンから呼び出すため
    window.openSidebar = () => {
      sidebar.classList.remove("hidden");
    };
  
}
