let fs = require('fs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');
const { get } = require('http');

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
                    username: {type: 'string'},
                    key: {type: 'string'},
                    data: {type: 'string', contentEncoding: 'base64'}
                },
                required: ['key', 'data'],
                additionalProperties: false
            },
        }
    }

    const getOptions = {
        schema: {
            headers: {
                type: 'object',
                properties: {
                    authorization : {type: 'string'},
                 },
                 required: ['authorization']
            }
        }
    }

    const patchOptions = {
        schema: {
            headers: {
                type: 'object',
                properties: {
                   authorization : {type: 'string'},
                },
                required: ['authorization']
            },
            body: {
                type: ['object', 'null'],
                properties: {
                    username: {type: 'string'}
                },
                additionalProperties: false
            }
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
                
                let userToModify;
                
                if(decoded.admin){
                    userToModify = request.body.hasOwnProperty('username') ? request.body.username : decoded.username;
                }
                else{
                    if(request.body.hasOwnProperty('username')){    //if username in the body
                        if(request.body.username == decoded.username){
                            userToModify = decoded.username;
                        }
                        else{
                            throw new Error (1);
                        }
                    }
                    else{   //no username in the body
                        userToModify = decoded.username;
                    }
                }
                

                try{
                    let filedata = JSON.parse(fs.readFileSync(DATAFILE, 'utf-8'));

                    //check if key is already present

                    //index corresponding to username
                    let index = filedata.data.reduce((acc, item, ind) => item.username == userToModify ? ind : acc, -1);
                    let userData;
                    //array of userData
                    if(index >= 0){
                        userData = filedata.data[index].userData;
                    }
                    else{
                        throw new Error("User not registered");
                    }
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
                catch(err){
                    reply.status(500).send(err.message);
                }

            }
            catch(err){
                //reply.send(err);
                reply.status(403).send(err.message == 1 ? "You don't have access to that account" : "Invalid Token");
            }
        }
        else{
            reply.send("No Bearer Authorization");
        }
    });

    fastify.get('/data/:key', getOptions, async (request, reply) => {
        //NO ADMIN POWERS SINCE BODY HAS NO MEANING IN GET REQUESTS

        const keyRequest = request.params.key;

        let headers = request.headers.authorization.split(" ");

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            let decoded;

            try{
                //check if token is ok
                decoded = jwt.verify(token, SECRET);
            }
            catch{
                reply.send("Invalid token");
            }

            let userToModify = decoded.username;

            try{    //read the file
                let filedata = JSON.parse(fs.readFileSync(DATAFILE, 'utf-8'));

                //index corresponding to username
                let index = filedata.data.reduce((acc, item, ind) => item.username == userToModify ? ind : acc, -1);
                let userData;

                if(index >= 0){
                    //array of userData
                    userData = filedata.data[index].userData;
                }
                else{
                    throw new Error("User not registered");
                }

                let dataIndex = userData.reduce((acc, item, ind) => item.key == keyRequest ? ind : acc, -1);

                if(dataIndex >= 0){
                    console.log("ok", index, dataIndex);
                    reply.send(userData[dataIndex].data);
                }
                else{
                    throw new Error("Key not present");
                }

            }
            catch(err){
                reply.status(500).send(err.message);
            }   
        }
        else{
            reply.send("No Bearer");
        }

        reply.send(keyRequest);
    })

    fastify.patch('/data/:key', getOptions, async (request, reply) => {
        const keyRequest = request.params.key;

        let headers = request.headers.authorization.split(" ");
        let {key, data} = request.body;

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            try{
                //check if token is ok
                let decoded = jwt.verify(token, SECRET);
                
                let userToModify;
                if(decoded.admin){
                    userToModify = request.body.hasOwnProperty('username') ? request.body.username : decoded.username;
                }
                else{
                    if(request.body.hasOwnProperty('username')){    //if username in the body
                        if(request.body.username == decoded.username){
                            userToModify = decoded.username;
                        }
                        else{
                            throw new Error (1);
                        }
                    }
                    else{   //no username in the body
                        userToModify = decoded.username;
                    }
                }
            }
            catch{

            }
        }
        else{
            reply.send("No Bearer");
        }

        reply.send(keyRequest);
    })

    fastify.delete('/data/:key', getOptions, async (request, reply) => {
        const keyRequest = request.params.key;

        let headers = request.headers.authorization.split(" ");
        let {key, data} = request.body;

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            try{
                //check if token is ok
                let decoded = jwt.verify(token, SECRET);
                
                let userToModify;
                if(decoded.admin){
                    userToModify = request.body.hasOwnProperty('username') ? request.body.username : decoded.username;
                }
                else{
                    if(request.body.hasOwnProperty('username')){    //if username in the body
                        if(request.body.username == decoded.username){
                            userToModify = decoded.username;
                        }
                        else{
                            throw new Error (1);
                        }
                    }
                    else{   //no username in the body
                        userToModify = decoded.username;
                    }
                }
            }
            catch{

            }
        }
        else{
            reply.send("No Bearer");
        }

        reply.send(keyRequest);
    })

}

module.exports = data;