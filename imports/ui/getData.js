import _ from 'lodash';
import url from 'url';

let _configObj = {};
let _log = [];
let countId = 0;
let pendingCall;

function callAPI (pathname, params = {}) {
  let URLObj = _.cloneDeep(_configObj);
  URLObj['pathname'] = (URLObj['pathname'] || '') + pathname;
  _.assign(URLObj['query'], params);
  let ownId = _.cloneDeep(countId);
  countId++;
  pendingCall = ownId;
  return fetch(unescape(url.format(URLObj)))
    .then(response => response.json())
		.then(received => {
      if (pendingCall !== ownId) {
        return { 'data': null };
      }
      if (typeof received !== 'object') {
        throw new Error(received);
      }
      _log.push(received);
			let error = _.get(received, 'error');
			if (error) {
				throw new Error(error.toString());
			}
			return received;
		})
    .then(received => received.data);
}

const getData = {
	'provider': () =>	callAPI('/providers/keys'),
	'dataset': selectedProvider => callAPI('/providers/' + selectedProvider + '/datasets/keys'),
	'frequency': selectedDataset =>	callAPI('/datasets/' + selectedDataset + '/frequencies'),
	'dimension': selectedDataset =>	callAPI('/datasets/' + selectedDataset + '/dimensions'),
	'series': (selectedDataset, params) => callAPI('/datasets/' + selectedDataset + '/series', params),
	'values': selectedSeries =>	callAPI('/series/' + _.join(selectedSeries, '+'))
};

function getUrl (selectedDataset, params) {
  let pathname = '/datasets/' + selectedDataset + '/values';
  let URLObj = _.cloneDeep(_configObj);
  URLObj['pathname'] = (URLObj['pathname'] || '') + pathname;
  _.assign(URLObj['query'], params);
  return unescape(url.format(URLObj))
}

function getLog () {
  return _log;
}

function feedConfig (config) {
  _configObj = config;
}

function initConfig () {
  // axios.get('/config')
  //   .then(received => received.data)
  //   .then(config => _configObj = config);
  _configObj = {
    'protocol': "http",
    'hostname': "widukind-api.cepremap.org",
    'pathname': "/api/v1/json",
    'query': {
      'per_page': 10
    }
  };
  return Promise.resolve();
}

export { getData, getUrl, getLog, feedConfig, initConfig };
