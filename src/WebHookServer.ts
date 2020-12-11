import http from 'http';
import crypto from 'crypto';
import { exec } from 'child_process';
import fs from "fs";

let test;
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const SECRET = config.gitSecret;

http
    .createServer((req, res) => {
        console.log("Request retrieved.")
        req.on('data', chunk => {
            console.log("Incoming Message...")
            const signature = `sha1=${crypto
                .createHmac('sha1', SECRET)
                .update(chunk)
                .digest('hex')}`;

            const isAllowed = req.headers['x-hub-signature'] === signature;

            const body = JSON.parse(chunk);

            const isMaster = body?.ref === 'refs/heads/master';

            if (isAllowed && isMaster) {
                console.log("Worked!")
            }
        });

        res.end();
    })
    .listen(7021);
console.log("Listening on Port 7021...")