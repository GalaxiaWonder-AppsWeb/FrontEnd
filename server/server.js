// Server with middleware for logging
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./server/db.json');
const middlewares = jsonServer.defaults();
const routes = require('./server/routes.json');

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add detailed logging middleware
server.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Log body for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log query parameters if they exist
  if (Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query parameters:`, req.query);
  }

  // Capture the original res.json method
  const originalJson = res.json;
  res.json = function(data) {
    // Only log abbreviated response for large data sets
    const logData = Array.isArray(data) && data.length > 10 
      ? { count: data.length, sample: data.slice(0, 3) }
      : data;
      
    console.log(`[${timestamp}] Response:`, JSON.stringify(logData, null, 2));
    return originalJson.call(this, data);
  };

  next();
});

// Add custom routes
server.use(jsonServer.rewriter(routes));

// Use router
server.use(router);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Routes configured: ${JSON.stringify(routes, null, 2)}`);
});
