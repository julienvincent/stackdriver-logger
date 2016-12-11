import createLogger from '../index'

const logger = createLogger({
   service: "test_service",
   projectId: "yumo-1384",
   keyFilename: __dirname + "/service-account.json"
})

logger.critical("something went wrong", {
   user: {
      firstName: "julien vincent"
   }
})