const jsonServer = require('json-server');
const path = require('path');
const auth = require('./middlewares/auth');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ noCors: true });

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(auth.corsHeaders);
server.use(auth.networkDelay);
server.use(auth.authRoutes);
server.use(auth.requireAuth);
server.use(router);

const PORT = process.env.MOCK_PORT || 3001;

server.listen(PORT, () => {
  console.log(`Checkly mock API: http://localhost:${PORT}`);
});
