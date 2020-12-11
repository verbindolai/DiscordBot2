import express from 'express';
import * as bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/', function(request, response){
    console.log(request.body);      // your JSON
});

app.listen(7021);
console.log("Listening on 7021...")