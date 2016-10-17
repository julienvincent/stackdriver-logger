'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createLogger = exports.default = undefined;

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createLogger = function createLogger(ConnectionInfo) {
    var socket = (0, _socket2.default)(ConnectionInfo.url);
    var _log = console.log;

    var connected = false;
    var backlog = [];

    socket.on('connect', function () {
        socket.emit('register', {
            token: ConnectionInfo.token,
            kind: ConnectionInfo.kind,
            pod: ConnectionInfo.pod
        });
    });

    socket.on('accepted', function () {
        connected = true;
        var reLog = backlog;
        backlog = [];

        _lodash2.default.forEach(reLog, function (log) {
            socket.emit('log', log);
        });
    });

    socket.on('rejected', function () {
        console.log("Rejected from logging server");
    });

    var logger = function logger(message, payload, level) {
        var log = {
            message: message,
            payload: payload || null,
            level: level || "INFO",
            timestamp: _lodash2.default.now()
        };

        _log(log.message);
        if (payload) _log(payload);

        if (connected) {
            socket.emit('log', log);
        } else {
            backlog.push(log);
        }
    };

    logger.error = function (message, payload) {
        logger(message, payload, "ERROR");
    };

    logger.warn = function (message, payload) {
        logger(message, payload, "WARNING");
    };

    if (ConnectionInfo.consume) {
        console.log = function () {
            for (var _len = arguments.length, messages = Array(_len), _key = 0; _key < _len; _key++) {
                messages[_key] = arguments[_key];
            }

            logger(messages[0], messages);
        };

        console.error = function () {
            for (var _len2 = arguments.length, messages = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                messages[_key2] = arguments[_key2];
            }

            logger.error(messages[0], messages);
        };
    }

    return logger;
};

exports.default = createLogger;
exports.createLogger = createLogger;