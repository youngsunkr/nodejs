'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupVersionCheck = setupVersionCheck;

var _boom = require('boom');

function setupVersionCheck(server, config) {
  const versionHeader = 'kbn-version';
  const actualVersion = config.get('pkg.version');

  server.ext('onPostAuth', function (req, reply) {
    const versionRequested = req.headers[versionHeader];

    if (versionRequested && versionRequested !== actualVersion) {
      return reply((0, _boom.badRequest)('Browser client is out of date, please refresh the page', {
        expected: actualVersion,
        got: versionRequested
      }));
    }

    return reply.continue();
  });
}