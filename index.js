// @flow
import io from 'socket.io-client'
import _ from 'lodash'

type ConnectionInfoType = {
    url: String,
    key: String,
    pod: String,
    kind: String
}

type Level = "INFO" | "WARNING" | "ERROR"

type SocketIO = {
    on: Function,
    emit: Function
}

const createLogger = (ConnectionInfo: ConnectionInfoType) => {
    const socket: SocketIO = io(ConnectionInfo.url)

    let connected = false
    const backlog = []

    socket.on('connect', () => {
        socket.emit('register', {
            key: ConnectionInfo.key,
            kind: ConnectionInfo.kind,
            pod: ConnectionInfo.pod
        })
    })

    socket.on('accepted', () => {
        connected = true

        _.forEach(backlog, (log, i) => {
            socket.emit('log', log)
            backlog.splice(i, 1)
        })
    })

    const logger = (message: String, payload: ?any, level: ?Level) => {
        const log = {
            message,
            payload: payload || null,
            level: level || "INFO",
            timestamp: _.now()
        }
        
        console.log(`[${log.timestamp}] [${log.level}] ${log.message}`)

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

    return logger
}

export { createLogger as default, createLogger }