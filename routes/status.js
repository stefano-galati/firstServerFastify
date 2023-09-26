
async function status (fastify, options) {
    
  fastify.get('/status', async (request, reply) => {
      return { status: 'ok' }
    })
  }
  
 /*
  fastify.route({
    method: 'GET',
    url: '/status',
    handler: function (request, reply) {
      reply.send({ hello: 'world' })
    }
  })
}
*/

module.exports = status;

console.log(module.exports);