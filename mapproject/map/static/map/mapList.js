document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('show-create-map-form')?.addEventListener('click', () => {
    const form = document.getElementById('create-map-form');
    form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
  });

  document.getElementById('submit-new-map')?.addEventListener('click', () => {
    const name = document.getElementById('new-map-name').value;
    if (!name.trim()) {
      alert('マップ名を入力してください');
      return;
    }

    fetch("/map/create/", {
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
      }
    });
  });
});
