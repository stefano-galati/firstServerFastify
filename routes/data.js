let fs = require('fs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');

const DATAFILE = "data.json";
const SECRET = "baubaumiciomicio";

async function data(fastify, options){

    function sha256(content){
        return crypto.createHash('sha256').update(content).digest('base64');    //maybe hex better?
    }

    const postOptions = {
        schema: {
            headers: {
                type: 'object',
                properties: {
                   authorization : {type: 'string'},
                },
                required: ['authorization'],
            },
            body: {
                type: 'object',
                properties: {
                    key: {type: 'string'},
                    data: {type: 'string', contentEncoding: 'base64'}
                },
                required: ['key', 'data'],
                additionalProperties: false
            },
        }
    }

    fastify.post('/data', postOptions, async (request, reply) => {
        let headers = request.headers.authorization.split(" ");
        let {key, data} = request.body;

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            try{
                //check if token is ok
                let decoded = jwt.verify(token, SECRET);

                try{
                    let filedata = JSON.parse(fs.readFileSync(DATAFILE, 'utf-8'));

                    //check if key is already present

                    //index corresponding to username
                    let index = filedata.data.reduce((acc, item, ind) => item.username == decoded.username ? ind : acc, 0);
                    //array of userData
                    let userData = filedata.data[index].userData;

                    //console.log("-------------------\n\n",userData.filter(item => item.key == key));
                    
                    if(userData.filter(item => item.key == key).length == 0){  //if the array of items with the chosen key is empty
                        console.log("BauBau");

                        userData.push({key, data});
                        console.log("------aaaaa-------\n\n", index);

                        filedata.data[index].userData = userData;   //update userData

                        //update file
                        fs.writeFile(DATAFILE, JSON.stringify(filedata), 'utf-8', function(err){
                            if (err) throw err;
                            console.log("Successfully written to file.");
                        });

                        reply.send(`${decoded.username}, data successfully stored!`);
                    }
                    else{
                        reply.send("Key already present");
                    }

                }
                catch{
                    reply.status(500).send("Error");
                }

            }
            catch{
                reply.status(403).send("Invalid Token");
            }
        }
        else{
            reply.send("No Bearer Authorization");
        }
    });

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