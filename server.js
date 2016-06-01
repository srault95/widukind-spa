var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var rp = require('request-promise');
var url = require('url');
var config = require('config');
var _ = require('lodash');
//var EventEmitter = require('events').EventEmitter;

var configURLObj = config.get('api.URLObj');
var URLObj = {
  'protocol': process.env['WIDUKIND_API_PROTOCOL'] || configURLObj['protocol'],
  'host': process.env['WIDUKIND_API_HOST'] || configURLObj['host'],
  'hostname': process.env['WIDUKIND_API_HOSTNAME'] || configURLObj['hostname'],
  'port': process.env['WIDUKIND_API_PORT'] || configURLObj['port'],
  'pathname': process.env['WIDUKIND_API_PATHNAME'] || configURLObj['pathname'],
  'query': {
    'limit': process.env['WIDUKIND_SPA_LIMIT'] || _.get(configURLObj, 'query.limit')
  }
};

var app = express();
app.set('port', (process.env['WIDUKIND_SPA_PORT'] || config.get('app.port')));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});



app.use('/data/:key', function (req, res, next) {
  function makeQuery (controls) {
    var res = {};
    _.forEach(controls, function (el) {
      el = JSON.parse(el);
      if (!_.isEmpty(el.selected)) {
        var tmp = {};
        tmp[el.name] = _.join(el.selected, '+');
        _.assign(res, tmp);
      }
    });
    return res;
  }

  var URL = _.clone(URLObj);
  var pathname = URL['pathname'] || '';
  switch (req.params.key) {
    case 'providers':
      pathname += '/providers/keys'; break;
    case 'datasets':
      pathname += '/providers/'+req.query['provider']+'/datasets/keys'; break;
    case 'dimensions':
      pathname += '/datasets/'+req.query['dataset']+'/dimensions'; break;
    case 'json':
      pathname += '/datasets/'+req.query['dataset']+'/values';
      _.assign(URL['query'], makeQuery(req.query['controls'])); break;
    default:
      var err = new Error();
      err.status = 400;
      return next(err);
  }
  URL['pathname'] = pathname;

  rp(unescape(url.format(URL)))
    .then(function (response) {
      req.responseData = response;
      next();
    })
    .catch(next);
}, function (req, res, next) {
  res.status(200).json(req.responseData);
});

app.use(function (err, req, res, next) {
  res.status(err.status).json(err);
});



var server = require('http').Server(app);
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  socket.emit('urlChange', URLObj);
  // listener.on('newUrl', function () {
  //   socket.emit('urlChange', URLObj);
  // })
});

server.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:'+app.get('port')+'/');
});
