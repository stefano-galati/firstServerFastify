const fastify = require("fastify")({
    logger: true
});

fastify.register(require('./routes/status.js'));
fastify.register(require('./routes/user.js'));
fastify.register(require('./routes/data.js'));


fastify.get('/', function(req, reply){
    reply.send({
        hello: 'world'
    })
})


const start = async () => {
    try {
      await fastify.listen({ port: 3000 })
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
}
start()