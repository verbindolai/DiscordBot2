import express, {Express, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import crypto from "crypto";
import fs from "fs";
import * as child_process from 'child_process';
import {exec} from "child_process";

class WebHookServer {
     private app : Express;
     private readonly secret : string;
     private readonly sigHeaderName : string;
     private readonly defaultBranch: string;
     private repos : string[];
     private readonly port : number;
     private repoPath : string;

     constructor(repoPath: string, defaultBranch : string, repos : string [], port: number) {
         this.app = express();
         this.sigHeaderName = 'x-hub-signature-256';
         this.secret = JSON.parse(fs.readFileSync('config.json', 'utf8')).gitSecret;
         this.defaultBranch = defaultBranch;
         this.repos = repos;
         this.port = port;
         this.repoPath = repoPath;
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
             response.status(200);
         });
         this.app.listen(this.port);
         console.log(`Listening on ${this.port} ...`);
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

         for (let i = 0; i < this.repos.length; i++){
             if (data.repository.name === this.repos[i]){
                 if (data.ref === "refs/heads/" + this.defaultBranch){
                     console.log("Executing Script: ")
                     exec('sudo bash ' + this.repoPath + this.repos[i] + "/update.sh", (err, stdout, stderr) => {
                         if (err) {
                             console.log(err);
                             return;
                         }
                         console.log(`stdout: ${stdout}`);
                         console.log(`stderr: ${stderr}`);
                     });
                 }
             }
         }
     }
}
let server : WebHookServer = new WebHookServer("/home/pi/.djsbots/","Developer", ["DiscordBot2", "DiscordBot"], 7021);
server.start();

