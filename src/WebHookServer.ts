import express, {Express, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import crypto from "crypto";
import fs from "fs";
import * as child_process from 'child_process';
import {exec} from "child_process";

class WebHookServer {
     app : Express;
     secret : string;
     sigHeaderName : string;

     constructor() {
         this.app = express();
         this.sigHeaderName = 'x-hub-signature-256';
         this.secret = JSON.parse(fs.readFileSync('config.json', 'utf8')).gitSecret;
         this.init();
     }

     init (): void {
        this.app.use(bodyParser.json());
     }

     start(): void{
         this.app.post('/' , (request, response) =>{

             const payload = JSON.stringify(request.body);

             if (!payload){
                 console.log("Body is empty.");
                 return;
             }

             if (!this.validateSignature(request, response)){
                 response.status(500).send({
                     message: 'Invalid signature.'
                 });
                 throw new Error("Invalid signature.");
             }

             this.action(request, response);
         });
         this.app.listen(7021);
         console.log("Listening on 7021...");
     }

     validateSignature(request: Request, response : Response) : boolean {
         //Get Signature from Secret
         const expectedSignature = "sha256=" +
             crypto.createHmac("sha256", this.secret)
                 .update(JSON.stringify(request.body))
                 .digest("hex");

         //Request-Header Signature
         const signature = request.headers[this.sigHeaderName];

         return signature === expectedSignature;
     }

     action(request: Request, response : Response) : void {
         console.log(request.body)
         console.log(request.headers)

         let data = request.body;
         if (data.repository.name === "DiscordBot2"){
             if(data.ref === "refs/heads/WebHookServer2"){
                 console.log("Executing Script: ")
                 exec('echo "Test"');
             }
         }
     }

}
let server : WebHookServer = new WebHookServer();
server.start();

