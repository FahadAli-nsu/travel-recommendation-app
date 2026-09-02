// ===== Farflung Travel — search & recommendation rendering =====

let travelData = null;

async function loadTravelData() {
  if (travelData) return travelData;
  const response = await fetch('travel_recommendation_api.json');
  travelData = await response.json();
  return travelData;
}

function createPostcard({ badge, name, imageUrl, description }) {
  const card = document.createElement('article');
  card.className = 'postcard';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = name;
  img.loading = 'lazy';

  const body = document.createElement('div');
  body.className = 'postcard-body';

  const badgeEl = document.createElement('span');
  badgeEl.className = 'postcard-badge';
  badgeEl.textContent = badge;

  const title = document.createElement('h3');
  title.textContent = name;

  const desc = document.createElement('p');
  desc.textContent = description;

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Add to wishlist';
  btn.addEventListener('click', () => {
    btn.textContent = 'Added ✓';
    btn.disabled = true;
  });

  body.appendChild(badgeEl);
  body.appendChild(title);
  body.appendChild(desc);
  body.appendChild(btn);
  card.appendChild(img);
  card.appendChild(body);

  return card;
}

function renderResults(items, heading) {
  const grid = document.getElementById('results-grid');
  const headingEl = document.getElementById('results-heading');
  if (!grid) return;

  grid.innerHTML = '';

  if (headingEl) {
    headingEl.textContent = heading || '';
  }

  if (!items || items.length === 0) {
    grid.innerHTML = '<p class="no-results">No destinations matched that search. Try "beach", "temple", or a country like "Japan".</p>';
    return;
  }

  items.forEach((item) => grid.appendChild(createPostcard(item)));
}

function showEmptyState() {
  const grid = document.getElementById('results-grid');
  const headingEl = document.getElementById('results-heading');
  if (headingEl) headingEl.textContent = '';
  if (grid) {
    grid.innerHTML = '<p class="empty-state">Search for "beach", "temple", or a country name above to see hand-picked recommendations.</p>';
  }
}

async function handleSearch(event) {
  if (event) event.preventDefault();

  const input = document.getElementById('search-input');
  const query = (input && input.value ? input.value : '').trim().toLowerCase();

  if (!query) {
    showEmptyState();
    return;
  }

  const data = await loadTravelData();

  if (query.includes('beach')) {
    const items = data.beaches.map((b) => ({ ...b, badge: 'Beach' }));
    renderResults(items, `Beaches for you`);
    return;
  }

  if (query.includes('temple')) {
    const items = data.temples.map((t) => ({ ...t, badge: 'Temple' }));
    renderResults(items, `Temples for you`);
    return;
  }

  const matchedCountry = data.countries.find((c) =>
    c.name.toLowerCase().includes(query) || query.includes(c.name.toLowerCase())
  );

  if (matchedCountry) {
    const items = matchedCountry.cities.map((city) => ({
      ...city,
      name: `${city.name}, ${matchedCountry.name}`,
      badge: matchedCountry.name,
    }));
    renderResults(items, `Recommendations in ${matchedCountry.name}`);
    return;
  }

  renderResults([], `No matches for "${query}"`);
}

function handleClear(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  showEmptyState();
}

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const clearBtn = document.getElementById('clear-btn');

  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }

  showEmptyState();
});
