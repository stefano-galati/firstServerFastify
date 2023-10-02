const { datafile, secret } = require('../server');

let fs = require('fs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');

async function user (fastify, options) {

    function sha256(content){
        return crypto.createHash('sha256').update(content).digest('base64');    //maybe hex better?
    }


    const registerOptions = {
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: {type: 'string'},
                    password: {type: 'string'}
                },
                required: ['username', 'password'],
                additionalProperties: false
            }
        }
    }

    const loginOptions = {
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: {type: 'string'},
                    password: {type: 'string'}
                },
                required: ['username', 'password'],
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
                required: ['authorization'],
            },
            body:{
                type: ['object', 'null'],
                properties:{
                    username: {type: 'string'}
                },
                additionalProperties: false
            }
        }
    }


    fastify.post('/register', registerOptions, async (request, reply) => {

        try{

            let filedata = fs.readFileSync(datafile, 'utf-8');
            if(filedata == ""){ //empty file
                console.log("Empty");
                filedata = {data:[]};   //array of {key: value}
            }
            else{
                filedata = JSON.parse(filedata);
            }

            //check if username already registered
            let index = filedata.data.reduce((acc, item, ind) => item.username == request.body.username ? ind : acc, -1);
            if(index == -1){
                //hash the password
                let hash = sha256(request.body.password);
    
                filedata.data.push({...request.body, password:hash, userData: [], admin: false});
                //reply.send(data);
            
                //TODO avoid multiple accounts with the same username
    
                fs.writeFile(datafile, JSON.stringify(filedata), 'utf-8', function(err){
                if (err) throw err;
                });

                reply.send("Account successfully registered");
            }
            else{
                reply.send("Username already registered");
            }
    
            
        }

        catch(error){  //errors reading the file
            reply.status(500).send(error);
        }

    })


    fastify.post('/login', loginOptions, async (request, reply) => {

        //check username, password
        let {username, password} = request.body;


        try{
            let filedata = JSON.parse(fs.readFileSync(datafile, 'utf-8'));
            let found = false;
            let hash, payload;
            let data = filedata.data;

            for (let i=0; i<data.length; i++){      //check if username exists in the filesystem
                if(data[i].username == username){
                    found = true;
                    hash = data[i].password;
                    payload = data[i];
                    delete payload.userData;
                    //console.log(payload);
                };
            }

            if(found){  
                if(sha256(password) == hash){   //check if password in the request corresponds to the same hash
                    let token = jwt.sign(payload, secret, {algorithm: 'HS256'});
                    reply.send({token});
                }
                else{
                    reply.send("Wrong password");
                }
            }
            else{
                reply.send("Username does not exist");
            }
            
            
        }
        catch(error){
            reply.status(500).send(error);
        }

        

    })


    fastify.delete('/delete', deleteOptions, async (request, reply) => {
        
        //$ curl -H 'authorization: Bearer <Token>'
        let stop = false;
        let headers = request.headers.authorization.split(" ");

        if(headers[0] == "Bearer"){     //Is this check needed?
            let token = headers[1]; 
            try{
                //check if token is ok
                let decoded = jwt.verify(token, secret);
                //let userToDelete = request.body.username || decoded.username;
                //console.log(request.hasOwnProperty('body'), request.body);

                let userToDelete = request.body !== undefined ? request.body.username : decoded.username; 

                //check if token corresponds to username OR ADMIN
                if(decoded.username == userToDelete || decoded.admin == true){
                    //remove account
                    try{
                        let filedata = JSON.parse(fs.readFileSync(datafile, 'utf-8'));
                        let data = filedata.data;

                        for(let i=0; i<data.length && !stop; i++){
                            if(data[i].username == userToDelete){
                                stop = true;
                                data.splice(i,1);
                            }
                        }
                        if(!stop){
                            reply.send("No user found");
                        }
                        else{
                            filedata = {data};

                        fs.writeFile(datafile, JSON.stringify(filedata), 'utf-8', function(err){
                            if (err) throw err;
                            console.log("Successfully written to file.");
                        });

                        reply.send("Account successfully removed");
                        }
                                
                    }
                    catch{
                        reply.status(500).send("Error");
                    }
                }
                else{
                    reply.status(403).send("You don't have access to that account");
                }

                
            }
            catch(err){
                reply.status(403).send(err);
            }
        }
        else{
            reply.send("No Bearer");
        }


    })

}

module.exports = user;

