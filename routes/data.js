const { datafile, secret } = require('../server');

let fs = require('fs');
let jwt = require('jsonwebtoken');
const { get } = require('http');

async function data(fastify, options){

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
                type: ['object'],
                properties: {
                    username: {type: 'string'},
                    newData: {type: 'string', contentEncoding: 'base64'}
                },
                additionalProperties: false
            }
        }
    }

    const deleteOptions = {
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
                let decoded = jwt.verify(token, secret);
                
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
                    let filedata = JSON.parse(fs.readFileSync(datafile, 'utf-8'));

                    //check if key is already present

                    //index corresponding to username
                    let index = filedata.users.reduce((acc, item, ind) => item.username == userToModify ? ind : acc, -1);
                    let userData;
                    //array of userData
                    if(index >= 0){
                        userData = filedata.users[index].userData;
                    }
                    else{
                        throw new Error("User not registered");
                    }
                    
                    if(userData.filter(item => item.key == key).length == 0){  //if the array of items with the chosen key is empty
                        console.log("BauBau");

                        userData.push({key, data});
                        console.log("------aaaaa-------\n\n", index);

                        filedata.users[index].userData = userData;   //update userData

                        //update file
                        fs.writeFile(datafile, JSON.stringify(filedata), 'utf-8', function(err){
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
                decoded = jwt.verify(token, secret);
            }
            catch{  //---------------------------------------------------------------------------------------------
                reply.send("Invalid token");
            }

            let userToModify = decoded.username;

            try{    //read the file
                let filedata = JSON.parse(fs.readFileSync(datafile, 'utf-8'));

                //index corresponding to username
                let index = filedata.users.reduce((acc, item, ind) => item.username == userToModify ? ind : acc, -1);
                
                let userData;
                if(index >= 0){
                    //array of userData
                    userData = filedata.users[index].userData;
                }
                else{
                    throw new Error("User not registered");
                }

                let dataIndex = userData.reduce((acc, item, ind) => item.key == keyRequest ? ind : acc, -1);

                if(dataIndex >= 0){
                    reply.send(userData[dataIndex].data);
                }
                else{
                    throw new Error("Key not present");
                }

            }
            catch(err){
                reply.status(404).send(err.message);
            }   
        }
        else{
            reply.send("No Bearer");
        }

        reply.send(keyRequest);
    })

    fastify.patch('/data/:key', patchOptions, async (request, reply) => {

        let headers = request.headers.authorization.split(" ");
        let dataRequest= request.body.newData;
        const keyRequest = request.params.key;

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            let decoded, userToModify;

            try{
                //check if token is ok
                decoded = jwt.verify(token, secret);

                if(decoded.admin){
                    userToModify = request.body.hasOwnProperty('username') ? request.body.username : decoded.username;
                }
                else{
                    if(request.body.hasOwnProperty('username')){    //if username in the body
                        if(request.body.username == decoded.username){
                            userToModify = decoded.username;
                        }
                        else{
                            throw new Error ("You don't have access to that account");
                        }
                    }
                    else{   //no username in the body
                        userToModify = decoded.username;
                    }
                }

                //check if key is present
                try{    //read the file
                    let filedata = JSON.parse(fs.readFileSync(datafile, 'utf-8'));
    
                    //index corresponding to username
                    let index = filedata.users.reduce((acc, item, ind) => item.username == userToModify ? ind : acc, -1);
                    
                    let userData;
                    if(index >= 0){
                        //array of userData
                        userData = filedata.users[index].userData;
                    }
                    else{
                        throw new Error("User not registered");
                    }
    
                    let dataIndex = userData.reduce((acc, item, ind) => item.key == keyRequest ? ind : acc, -1);
    
                    if(dataIndex >= 0){
                        //modify the key/data pair
                        filedata.users[index].userData[dataIndex].data = dataRequest;
                        try{
                            fs.writeFile(datafile, JSON.stringify(filedata), 'utf-8', function(err){
                                if (err) throw err;
                            });
                            reply.send("Data successfully modified!");
                        }
                        catch(err){
                            reply.status(500).send(err);
                        }
                    }
                    else{
                        throw new Error("Key not present");
                    }
    
                }
                catch(err){
                    reply.status(404).send(err.message);
                }

            }
            catch(err){
                reply.status(403).send(err.message);
            }
            
        }

        else{
            reply.send("No Bearer");
        }

    })

    fastify.delete('/data/:key', deleteOptions, async (request, reply) => {
        const keyRequest = request.params.key;

        let headers = request.headers.authorization.split(" ");

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            try{
                //check if token is ok
                let decoded = jwt.verify(token, secret);
                
                let userToModify;
                if(request.body !== undefined){
                    if(request.body.hasOwnProperty('username')){
                        if(decoded.admin){
                            userToModify = request.body.username;
                        }
                        else{
                            if(request.body.username == decoded.username){
                                userToModify = decoded.username
                            }
                            else{
                                throw new Error ("You don't have access to that account");
                            }
                        }
                    }
                }
                else{
                    userToModify = decoded.username;
                }

                //delete
                try{
                    let filedata = JSON.parse(fs.readFileSync(datafile, 'utf-8'));

                    //index corresponding to username
                    let index = filedata.users.reduce((acc, item, ind) => item.username == userToModify ? ind : acc, -1);
                    
                    if(index >= 0){
                        let userData = filedata.users[index].userData;
                        let dataIndex = userData.reduce((acc, item, ind) => item.key == keyRequest ? ind : acc, -1);                       
                        if(dataIndex >= 0){
                            //remove element from the array
                            filedata.users[index].userData.splice(dataIndex, 1);
                            //write back to file
                            try{
                                fs.writeFile(datafile, JSON.stringify(filedata), 'utf-8', function(err){
                                    if (err) throw err;
                                });
                                reply.send("Data successfully deleted!");
                            }
                            catch(err){
                                reply.status(500).send(err);
                            }
                        }
                        else{
                            reply.status(404).send("Key not found");
                        }
                        
                    }
                    else{
                        //reply.send(userToModify);
                        reply.status(404).send("User not found");
                    }
                }
                catch(err){
                    reply.status(500).send(err);
                }

            }
            catch(err){
                reply.status(403).send(err.message);
            }
        }
        else{
            reply.send("No Bearer");
        }
    })

}

module.exports = data;