'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerValueSuggestions = registerValueSuggestions;

var _lodash = require('lodash');

var _handle_es_error = require('../../../lib/handle_es_error');

var _handle_es_error2 = _interopRequireDefault(_handle_es_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerValueSuggestions(server) {
  server.route({
    path: '/api/kibana/suggestions/values/{index}',
    method: ['POST'],
    handler: async function (req, reply) {
      const { index } = req.params;
      const { field, query } = req.payload;
      const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
      const body = getBody({ field, query });
      try {
        const response = await callWithRequest(req, 'search', { index, body });
        const buckets = (0, _lodash.get)(response, 'aggregations.suggestions.buckets') || [];
        const suggestions = (0, _lodash.map)(buckets, 'key');
        reply(suggestions);
      } catch (error) {
        reply((0, _handle_es_error2.default)(error));
      }
    }
  });
}

function getBody({ field, query }) {
  // Helps ensure that the regex is not evaluated eagerly against the terms dictionary
  const executionHint = 'map';

  // Helps keep the number of buckets that need to be tracked at the shard level contained in case
  // this is a high cardinality field
  const terminateAfter = 100000;

  // We don't care about the accuracy of the counts, just the content of the terms, so this reduces
  // the amount of information that needs to be transmitted to the coordinating node
  const shardSize = 10;

  return {
    size: 0,
    timeout: '1s',
    terminate_after: terminateAfter,
    aggs: {
      suggestions: {
        terms: {
          field,
          include: `${getEscapedQuery(query)}.*`,
          execution_hint: executionHint,
          shard_size: shardSize
        }
      }
    }
  };
}

function getEscapedQuery(query = '') {
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html#_standard_operators
  return query.replace(/[.?+*|{}[\]()"\\#@&<>~]/g, match => `\\${match}`);
}