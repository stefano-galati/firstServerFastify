#Testing mediante curl

Dove è presente <Token>, inserire il token fornito come risposta al login.


Register
curl -H 'Content-Type: application/json' -d  '{"username":"mario", "password":"secret"}'  -X POST localhost:3000/register


Login
curl -H 'Content-Type: application/json' -d  '{"username":"mario", "password":"secret"}'  -X POST localhost:3000/login


Delete
curl -H 'Authorization: Bearer <Token>' -X DELETE localhost:3000/delete


Post
curl -H 'Authorization: Bearer <Token>' -H 'Content-Type: application/json' -d '{"key":"hello", "data":"world"}' -X POST localhost:3000/data


Patch
curl -H 'Authorization: Bearer <Token>' -H 'Content-Type: application/json' -d '{"newData":"newWorld"}' -X PATCH localhost:3000/data/hello


Get
curl -H 'Authorization: Bearer <Token>' -X GET localhost:3000/data/hello


Delete
curl -H 'Authorization: Bearer <Token>' -X DELETE localhost:3000/data/hello


Se si è loggati come utenti admin, inserire la key username all'interno del body della request per modificare i dati dell'utente scelto.
Ad esempio, dopo aver effettuato il login dell'account "mario" (supponendo che esso sia un account admin):
curl -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1hcmlvIiwicGFzc3dvcmQiOiJLN2dOVTNzZG8rT0wwd05ocW9WV2hyM2c2czF4WXY3Mm9sL3BlL1Vub2xzPSIsImFkbWluIjp0cnVlLCJpYXQiOjE2OTYyNzc0Njd9.1HvdXvoPiXF8FkLEf_SwRAty0YOQbMKEN73Npha_v18' -H 'Content-Type: application/json' -d '{"username":"luigi"}' -X DELETE localhost:3000/delete

Questa richiesta cancellerà l'account "luigi"