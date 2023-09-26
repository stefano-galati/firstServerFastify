let fs = require('fs');

async function user (fastify, options) {
    fastify.post('/register', async (request, reply) => {
        /*console.log('\n------\n', request.body, '\n-------\n');*/
        reply.send({data: request.body})
    })
    fastify.post('/login', async (request, reply) => {
        return request.body;
    })
    fastify.delete('/delete', async (request, reply) => {
        return { status: 'ok' }
    })

}

module.exports = user;

