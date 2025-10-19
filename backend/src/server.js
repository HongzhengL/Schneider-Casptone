const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const { loads, origins, destinations, profiles } = require('./data/loads');

/**
 * Return profile filters given a profile identifier. Accepts either an ID or
 * name. Unknown values return an empty object.
 * @param {string} idOrName
 */
function getProfileFilters(idOrName) {
  if (!idOrName) return {};
  const profile = profiles.find(
    (p) => p.id === idOrName || p.name === idOrName
  );
  if (!profile) return {};
  const { id, name, ...filters } = profile;
  return { ...filters };
}

/**
 * Merge profile filters with query parameters, allowing the latter to
 * override defaults provided by the profile.
 * @param {object} profileFilters
 * @param {object} query
 */
function mergeFilters(profileFilters, query) {
  const merged = { ...profileFilters };
  Object.keys(query).forEach((key) => {
    if (key === 'profile') return;
    const value = query[key];
    if (value !== undefined && value !== '') {
      merged[key] = value;
    }
  });
  return merged;
}

/**
 * Test whether a load satisfies the specified filters. See API documentation
 * for details on supported filters.
 * @param {object} load
 * @param {object} filters
 */
function loadMatchesFilters(load, filters) {
  // Origin city,state
  if (filters.origin) {
    const [city, state] = filters.origin.split(',').map((s) => s.trim());
    if (
      load.fromLocation.city.toLowerCase() !== city.toLowerCase() ||
      load.fromLocation.state.toLowerCase() !== state.toLowerCase()
    ) {
      return false;
    }
  }
  if (filters.originState) {
    if (
      load.fromLocation.state.toLowerCase() !==
      filters.originState.toLowerCase()
    ) {
      return false;
    }
  }
  // Destination city,state
  if (filters.destination) {
    const [city, state] = filters.destination.split(',').map((s) => s.trim());
    if (
      load.toLocation.city.toLowerCase() !== city.toLowerCase() ||
      load.toLocation.state.toLowerCase() !== state.toLowerCase()
    ) {
      return false;
    }
  }
  if (filters.destinationState) {
    if (
      load.toLocation.state.toLowerCase() !==
      filters.destinationState.toLowerCase()
    ) {
      return false;
    }
  }
  // Origin radius
  if (filters.originRadius) {
    const radius = parseFloat(filters.originRadius);
    if (!Number.isNaN(radius) && load.distanceToOrigin > radius) {
      return false;
    }
  }
  // Destination radius (same metric in this mock)
  if (filters.destinationRadius) {
    const radius = parseFloat(filters.destinationRadius);
    if (!Number.isNaN(radius) && load.distanceToOrigin > radius) {
      return false;
    }
  }
  // Min loaded RPM
  if (filters.minLoadedRpm) {
    const minRpm = parseFloat(filters.minLoadedRpm);
    if (!Number.isNaN(minRpm) && load.loadedRpm < minRpm) {
      return false;
    }
  }
  // Min and max distance
  if (filters.minDistance) {
    const minDistance = parseFloat(filters.minDistance);
    if (!Number.isNaN(minDistance) && load.distance < minDistance) {
      return false;
    }
  }
  if (filters.maxDistance) {
    const maxDistance = parseFloat(filters.maxDistance);
    if (!Number.isNaN(maxDistance) && load.distance > maxDistance) {
      return false;
    }
  }
  // Date filters
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    if (new Date(load.pickupDate) < start) {
      return false;
    }
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    if (new Date(load.dropDate) > end) {
      return false;
    }
  }
  return true;
}

/**
 * Serve a JSON response with status code and body.
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {any} body
 */
function sendJSON(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

/**
 * Serve static files from the public directory. Only GET requests are
 * supported and directory traversal is not allowed.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} filePath
 */
function serveStaticFile(req, res, filePath) {
  const normalized = path.normalize(filePath).replace(/^\/+/g, '');
  const fullPath = path.join(__dirname, '..', 'public', normalized);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    // Determine content type based on file extension
    const ext = path.extname(fullPath);
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';
  // API routes
  if (req.method === 'GET' && pathname === '/api/profiles') {
    return sendJSON(res, 200, profiles);
  }
  if (req.method === 'GET' && pathname.startsWith('/api/profiles/')) {
    const id = pathname.split('/').pop();
    const profile = profiles.find((p) => p.id === id);
    if (profile) return sendJSON(res, 200, profile);
    return sendJSON(res, 404, { error: 'Profile not found' });
  }
  if (req.method === 'GET' && pathname === '/api/origins') {
    return sendJSON(res, 200, origins);
  }
  if (req.method === 'GET' && pathname === '/api/destinations') {
    return sendJSON(res, 200, destinations);
  }
  if (req.method === 'GET' && pathname === '/api/loads/find') {
    const profileFilters = getProfileFilters(parsed.query.profile);
    const filters = mergeFilters(profileFilters, parsed.query);
    const result = loads.filter((load) => loadMatchesFilters(load, filters));
    return sendJSON(res, 200, result);
  }
  // Serve the index page at root or other static files under /public
  if (req.method === 'GET') {
    if (pathname === '/' || pathname === '/index.html') {
      return serveStaticFile(req, res, 'index.html');
    }
    // Serve JS/CSS from the public folder
    return serveStaticFile(req, res, pathname);
  }
  res.writeHead(404);
  res.end('Not Found');
});

const port = process.env.PORT || 3001;
if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = server;