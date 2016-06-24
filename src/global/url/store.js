var _ = require('lodash');
var Reflux = require('reflux');
/* global io */
var socket = io();

var c = require('./constants');
var actions = require('./actions');

var pattern = {};
pattern[c.config] = {};



var store = Reflux.createStore({
  listenables: [actions],
  getInitialState: function () {
    this.state = _.cloneDeep(pattern);
    return this.state;
  },
  init: function () {
    socket.on('urlChange', actions[c.updateConfig]);
  },
  refresh: function () {
    this.trigger(this.state);
  },

  onUpdateConfig: function (data) {
    this.state[c.config] = data;
    this.refresh();
  }
});

module.exports = store;
