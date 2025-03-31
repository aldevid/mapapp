// app.js
import { initMap, loadSpots } from './mapCore.js';
import { setupMapListUI } from './mapList.js';

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadSpots();
  setupMapListUI();
});
