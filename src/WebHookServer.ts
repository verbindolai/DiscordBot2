import express from 'express';
import * as bodyParser from 'body-parser';
import crypto from "crypto";
import fs from "fs";

const app = express();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const secret = config.gitSecret;
const sigHeaderName = 'X-Hub-Signature-256'
let test;

//app.use(bodyParser.json());

app.post('/', function(request, response){
    const payload = JSON.stringify(request.body);

    if (!payload){
        console.log("Body is empty.")
        return;
    }

    // calculate the signature
    const expectedSignature = "sha256=" +
        crypto.createHmac("sha256", secret)
            .update(JSON.stringify(request.body))
            .digest("hex");

    //Request-Header Signature
    const signature = request.headers[sigHeaderName];

    // compare the signature against the one in the request
    if (signature !== expectedSignature) {
        throw new Error("Invalid signature.");
    }

    console.log(request.body);
    console.log(request.headers)

});

app.listen(7021);
console.log("Listening on 7021...")

