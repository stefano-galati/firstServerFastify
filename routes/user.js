let fs = require('fs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');

const DATAFILE = "data.json";
const SECRET = "baubaumiciomicio";

async function user (fastify, options) {

    function sha256(content){
        console.log(content);
        return crypto.createHash('sha256').update(content).digest('base64');
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

            },
            response:{
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

            },
            response:{
            }
        }
    }


    fastify.post('/register', registerOptions, async (request, reply) => {

        try{

            let data = fs.readFileSync(DATAFILE, 'utf-8');
            if(data == ""){ //empty file
                console.log("Empty");
                data = {data:[]};   //array of {key: value}
            }
            else{
                data = JSON.parse(data);
            }
    
            //hash the password
            let hash = sha256(request.body.password);
    
            data.data.push({...request.body, password:hash, admin: false});
            reply.send(data);   //TODO remove
            //TODO avoid multiple accounts with the same username
    
            fs.writeFile(DATAFILE, JSON.stringify(data), 'utf-8', function(err){
                if (err) throw err;
                console.log("Successfully written to file.");
            });
        }

        catch{  //errors reading the file
            reply.status(500).send("Error");
        }

    })


    fastify.post('/login', loginOptions, async (request, reply) => {

        //check username, password
        let {username, password} = request.body;


        try{
            let filedata = JSON.parse(fs.readFileSync(DATAFILE, 'utf-8'));
            let found = false;
            let hash;
            let data = filedata.data;

            for (let i=0; i<data.length; i++){      //check if username exists in the filesystem
                if(data[i].username == username){
                    found = true;
                    hash = data[i].password;
                };
            }

            if(found){  
                if(sha256(password) == hash){   //check if password in the request corresponds to the same hash
                    let token = jwt.sign(request.body, SECRET, {algorithm: 'HS256'});
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
        catch{
            reply.status(500).send("Error");
        }

        

    })


    fastify.delete('/delete', async (request, reply) => {
        return { status: 'ok' }
    })

}

module.exports = user;

