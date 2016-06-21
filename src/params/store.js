var _ = require('lodash');
var Reflux = require('reflux');

var c = require('../constants');
var actions = require('../actions');

var pattern = {};
pattern[c.providers] = [];
pattern[c.selectedProvider] = '';
pattern[c.datasets] = [];
pattern[c.selectedDataset] = '';
pattern[c.frequencies] = [];
pattern[c.selectedFrequencies] = [];
pattern[c.dimensions] = [];
pattern[c.selectedDimensions] = [];
pattern[c.loading] = [];

var defaultValue = {
  'provider': 'insee',
  'dataset': 'insee-ipch-2015-fr-coicop'
}



var store = Reflux.createStore({
  listenables: [actions],
  getInitialState: function () {
    this.state = _.cloneDeep(pattern);
    return this.state;
  },
  refresh: function () {
    this.trigger(this.state);
  },

  load: function (key) {
    this.state[c.loading].push(key);
  },
  unload: function (key) {
    var index = this.state[c.loading].indexOf(key);
    this.state[c.loading].splice(index, 1);
  },

  /* Getters-Setters */
  getValidData: function (key) {
    if ((typeof this.state[key] !== typeof pattern[key]) ||
      ((this.state[key] instanceof Array) !== (pattern[key] instanceof Array))) {
      this.state[key] = pattern[key];
    }
    return this.state[key];
  },
    /* Providers */
  setSelectedProvider: function (data) {
    this.state[c.selectedProvider] = data;
    this.setDatasets([]);
    this.setSelectedDataset('');
  },
    /* Datasets */
  setDatasets: function (data) {
    this.state[c.datasets] = _.map(data, function (el) {
      return {'name': el, 'value': []};
    });
  },
  setSelectedDataset: function (data) {
    this.state[c.selectedDataset] = data;
    this.setDimensions({});
    this.setSelectedDimensions([]);
  },
    /* Frequencies */
  setFrequencies: function (data) {
    this.state[c.frequencies] = _.clone(data);
  },
  setSelectedFrequencies: function (data) {
    this.state[c.selectedFrequencies] = _.map(data, function (el) {
      return el.value;
    });
  },
    /* Dimensions */
  setDimensions: function (data) {
    this.state[c.dimensions] = [];
    _.forEach(Object.keys(data), function (el) {
      if (el !== 'freq' && el !== 'frequency') {
        var value = Object.keys(data[el]);
        this.state[c.dimensions].push({'name': el, 'value': value});
      }
    }.bind(this));
  },
  setSelectedDimensions: function (data) {
    this.state[c.selectedDimensions] = _.map(data, function (el) {
      var name = el.value;
      var value = _.get(_.find(this.getValidData(c.dimensions), {'name': name}), 'value');
      var selected =_.get(_.find(this.getValidData(c.selectedDimensions), {'name': name}), 'selected');
      if (!selected) {
        selected = [_.head(value)];
      }
      return {
        'name': name,
        'value': value,
        'selected': selected
      };
    }.bind(this));
  },
  /**/

  /* onActions */
  onProvidersMissing: function () {
    this.load('providers');
    this.refresh();
  },
  onProvidersMissingFailed: console.error,
  onProvidersMissingCompleted: function (data) {
    this.unload('providers');
    this.state[c.providers] = _.map(data, function (el) {
      return {'name': el, 'value': []};
    });
    var providers = this.getValidData(c.providers);
    if (!_.isEmpty(providers)) {
      var selectedProvider = this.getValidData(c.selectedProvider);
      if (_.isEmpty(selectedProvider)) {
        this.setSelectedProvider(defaultValue['provider']);
      }
    }
    this.refresh();
  },

  onDatasetsMissing: function () {
    this.load('datasets');
    this.refresh();
  },
  onDatasetsMissingFailed: console.error,
  onDatasetsMissingCompleted: function (data) {
    this.unload('datasets');
    this.setDatasets(data);
    var datasets = this.getValidData(c.datasets);
    if (!_.isEmpty(datasets)) {
      var selectedDataset = this.getValidData(c.selectedDataset);
      if (_.isEmpty(selectedDataset)) {
        this.setSelectedDataset(defaultValue['dataset']);
      }
    }
    this.refresh();
  },

  onFrequenciesMissing: function () {
    this.load('frequencies');
    this.refresh();
  },
  onFrequenciesMissingFailed: console.error,
  onFrequenciesMissingCompleted: function (data) {
    this.unload('frequencies');
    this.setFrequencies(data);
    var frequencies = this.getValidData(c.frequencies);
    if (!_.isEmpty(frequencies)) {
      var selectedFrequencies = this.getValidData(c.selectedFrequencies);
      if (_.isEmpty(selectedFrequencies)) {
        this.setSelectedFrequencies([{
          'value': _.head(frequencies)
        }]);
      }
    }
    this.refresh();
  },

  onDimensionsMissing: function () {
    this.load('dimensions');
    this.refresh();
  },
  onDimensionsMissingFailed: console.error,
  onDimensionsMissingCompleted: function (data) {
    this.unload('dimensions');
    this.setDimensions(data);
    var dimensions = this.getValidData(c.dimensions);
    if (!_.isEmpty(dimensions)) {
      var selectedDimensions = this.getValidData(c.selectedDimensions);
      if (_.isEmpty(selectedDimensions)) {
        var tmp = _.map(dimensions, function (el) {
          return { value: el.name };
        })
        this.setSelectedDimensions(tmp);
      }
    }
    this.refresh();
  },

  onChangeProvider: function (value) {
    this.setSelectedProvider(value.value);
    this.refresh();
  },
  onChangeDataset: function (value) {
    this.setSelectedDataset(value.value);
    this.refresh();
  },
  onChangeFrequencies: function (data) {
    this.setSelectedFrequencies(data);
    this.refresh();
  },
  onChangeDimensions: function (data) {
    this.setSelectedDimensions(data);
    this.refresh();
  },
  onChangeDimensionValues: function (data, dimensionName) {
    _.set(
      _.find(this.state[c.selectedDimensions], {'name': dimensionName}),
      'selected',
      _.map(data, function (el) { return el.value; })
    );
    this.refresh();
  }
  /**/

});

module.exports = store;
