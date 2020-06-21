/**
 * Examples of winston logg error levels when debugging
    log.error('U:' + user, message)
    log.fatal('U:' + user, message)
    log.info('U:' + user, message)
    log.trace('U:' + user, message)
    log.warn('U:' + user, message)
    log.debug('U:' + user, message)
 */

import 'dotenv/config' //environments with .env
import winston from 'winston'

const levelFile = process.env.LOGGER_LEVEL,
  allLogsFileName = process.env.LOGGER_FILE,
  errorFileNameFile = process.env.ERROR_LOGGER_FILE,
  maxSizeFile = process.env.LOGGER_LEVEL,
  maxFilesFile = process.env.LOGGER_MAX_FILE_SIZE,
  levelConsole = process.env.LOGGER_LEVEL_CONSOLE

const getFilePath = (module) => {
  //using filename in log statements
  return module.filename.split('/').slice(-2).join('/')
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: levelFile,
      filename: process.cwd() + allLogsFileName,
      handleException: true,
      json: true,
      maxSize: maxSizeFile,
      maxFiles: maxFilesFile,
      colorize: false,
    }),
    new winston.transports.File({
      level: 'error',
      filename: process.cwd() + errorFileNameFile,
      handleException: true,
      json: true,
      maxSize: maxSizeFile,
      maxFiles: maxFilesFile,
      colorize: true,
    }),
    new winston.transports.Console({
      level: levelConsole, //'debug',
      label: getFilePath(module),
      handleException: true,
      json: false,
      colorize: true,
    }),
  ],
})

export default logger
