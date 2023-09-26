async function data(fastify, options){
    fastify.post('/data', async (request, reply) => {
        return request.body;
    })
    fastify.get('/data/:key', async (request, reply) => {
        return request.body;
    })
    fastify.patch('/data/:key', async (request, reply) => {
        return request.body;
    })
    fastify.delete('/data/:key', async (request, reply) => {
        return request.body;
    })
}

module.exports = data;