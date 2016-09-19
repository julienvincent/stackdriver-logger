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

    var connected = false;
    var backlog = [];

    socket.on('connect', function () {
        socket.emit('register', {
            key: ConnectionInfo.key,
            kind: ConnectionInfo.kind,
            pod: ConnectionInfo.pod
        });
    });

    socket.on('accepted', function () {
        connected = true;

        _lodash2.default.forEach(backlog, function (log, i) {
            socket.emit('log', log);
            backlog.splice(i, 1);
        });
    });

    var logger = function logger(message, payload, level) {
        var log = {
            message: message,
            payload: payload || null,
            level: level || "INFO",
            timestamp: _lodash2.default.now()
        };

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

    return logger;
};

exports.default = createLogger;
exports.createLogger = createLogger;