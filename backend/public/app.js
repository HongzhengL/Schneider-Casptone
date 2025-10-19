// Front‑end logic for the load search page. This script fetches profiles,
// origins and destinations from the backend and populates the UI. When a
// profile is selected it pre‑fills the form. When the search button is
// pressed it fetches matching loads and displays them.

document.addEventListener('DOMContentLoaded', () => {
  const profileSelect = document.getElementById('profile-select');
  const originInput = document.getElementById('origin-input');
  const destinationInput = document.getElementById('destination-input');
  const originRadiusInput = document.getElementById('origin-radius-input');
  const destinationRadiusInput = document.getElementById('destination-radius-input');
  const resultsList = document.getElementById('results');

  // Load profiles and populate the profile drop‑down
  fetch('/api/profiles')
    .then((res) => res.json())
    .then((profiles) => {
      profiles.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        profileSelect.appendChild(opt);
      });
      profileSelect.dataset.profiles = JSON.stringify(profiles);
    })
    .catch(() => {});

  // Load origins and populate datalist
  fetch('/api/origins')
    .then((res) => res.json())
    .then((origins) => {
      const list = document.getElementById('origins-list');
      origins.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = `${o.city}, ${o.state}`;
        list.appendChild(opt);
      });
    })
    .catch(() => {});

  // Load destinations and populate datalist
  fetch('/api/destinations')
    .then((res) => res.json())
    .then((destinations) => {
      const list = document.getElementById('destinations-list');
      destinations.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = `${d.city}, ${d.state}`;
        list.appendChild(opt);
      });
    })
    .catch(() => {});

  // When a profile is selected, populate fields based on its stored values
  profileSelect.addEventListener('change', (e) => {
    const profileId = profileSelect.value;
    if (!profileId) {
      // Reset fields when no profile selected
      originInput.value = '';
      destinationInput.value = '';
      originRadiusInput.value = '';
      destinationRadiusInput.value = '';
      return;
    }
    const profiles = JSON.parse(profileSelect.dataset.profiles || '[]');
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      originInput.value = profile.origin || '';
      destinationInput.value = profile.destination || '';
      originRadiusInput.value = profile.originRadius !== undefined ? profile.originRadius : '';
      destinationRadiusInput.value = profile.destinationRadius !== undefined ? profile.destinationRadius : '';
    }
  });

  // Perform search and render results
  document.getElementById('search-button').addEventListener('click', () => {
    const params = new URLSearchParams();
    if (profileSelect.value) params.append('profile', profileSelect.value);
    if (originInput.value) params.append('origin', originInput.value);
    if (destinationInput.value) params.append('destination', destinationInput.value);
    if (originRadiusInput.value) params.append('originRadius', originRadiusInput.value);
    if (destinationRadiusInput.value) params.append('destinationRadius', destinationRadiusInput.value);
    fetch(`/api/loads/find?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // Clear previous results
        resultsList.innerHTML = '';
        if (!Array.isArray(data) || data.length === 0) {
          const li = document.createElement('li');
          li.textContent = 'No matching loads.';
          resultsList.appendChild(li);
          return;
        }
        data.forEach((load) => {
          const li = document.createElement('li');
          li.textContent = `${load.fromLocation.city}, ${load.fromLocation.state} → ${load.toLocation.city}, ${load.toLocation.state} | Distance: ${load.distance} mi | Price: $${load.price}`;
          resultsList.appendChild(li);
        });
      })
      .catch(() => {
        resultsList.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = 'Error fetching loads';
        resultsList.appendChild(li);
      });
  });
});