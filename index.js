// @flow
import io from 'socket.io-client'
import _ from 'lodash'

type ConnectionInfoType = {
    url: String,
    token: String,
    pod: String,
    kind: String,
    consume: Boolean
}

type Level = "INFO" | "WARNING" | "ERROR"

type SocketIO = {
    on: Function,
    emit: Function
}

const createLogger = (ConnectionInfo: ConnectionInfoType) => {
    const socket: SocketIO = io(ConnectionInfo.url)
    const _log = console.log

    let connected = false
    let backlog = []

    socket.on('connect', () => {
        socket.emit('register', {
            token: ConnectionInfo.token,
            kind: ConnectionInfo.kind,
            pod: ConnectionInfo.pod
        })
    })

    socket.on('accepted', () => {
        connected = true
        let reLog = backlog
        backlog = []

        _.forEach(reLog, log => {
            socket.emit('log', log)
        })
    })

    socket.on('rejected', () => {
        console.log("Rejected from logging server")
    })

    const logger = (message: String, payload: ?any, level: ?Level) => {
        const log = {
            message,
            payload: payload || null,
            level: level || "INFO",
            timestamp: _.now()
        }
        
        _log(`[${log.timestamp}] [${log.level}] ${JSON.stringify(log.message || null, null, 2).replace(/\"([^(\")"]+)\":/g, "$1:")}`)

        if (connected) {
            socket.emit('log', log)
        } else {
            backlog.push(log)
        }
    }

    logger.error = (message, payload) => {
        logger(message, payload, "ERROR")
    }

    logger.warn = (message, payload) => {
        logger(message, payload, "WARNING")
    }

    if (ConnectionInfo.consume) {
        console.log = (...messages) => {
            logger(messages[0], messages)
        }

        console.error = (...messages) => {
            logger.error(messages[0], messages)
        }
    }

    return logger
}

export { createLogger as default, createLogger }