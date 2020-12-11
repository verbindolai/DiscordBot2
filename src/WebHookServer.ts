import express from 'express';
import * as bodyParser from 'body-parser';
import fs from "fs";


const app = express();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const secret = config.gitSecret;
const sigHeaderName = 'X-Hub-Signature-256';


app.use(bodyParser.json());
app.post('/' ,function(request, response){
    console.log(request.body)
    //console.log(request.headers)
});

app.listen(7021);
console.log("Listening on 7021...");

