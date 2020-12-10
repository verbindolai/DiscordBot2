
import discord, { Channel, Client, Collection, Guild, GuildMember, Message } from 'discord.js';
import fs from 'fs';
import { executor } from './commands/executor';
export class Bot{

    private client : Client;
    private config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    private commands: discord.Collection<string, executor>;

    constructor () {
        this.client = new discord.Client;
        this.commands = new discord.Collection();
        this.addComms();
    }

    /*
    Adds all Command-Instances from the Command-Classes in the "commands"-Directory to the Command-Map
    */
    private addComms () : void {
        const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.ts') && file !== 'executor.ts');
        for (const file of commandFiles) {
            const fileWithoutTS = file.replace(".ts","");
            let command : executor = require(`./commands/${fileWithoutTS}`);
            this.commands.set(command.name, command);
        }  
        console.log("Active Commands: \n")
        console.log(this.commands);
    }

    /*
    Logs the Bot with the Token in and starts the Event-Listening / Evént-Handling
    */
    public start (): void {
        this.client.login(this.config.token);
        this.onReady();
        this.onMemberUpdate();
        this.onMessage();
    }
    
    /*
    On Ready Event
    */
    public onReady() : void {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this?.client?.user?.username}...`)
        });
    }

    /*
    On GuildMember Update Event i.e. role or nickname change
    */
    public onMemberUpdate() : void {
        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
        })
    }

     /*
    On Message Event, get triggered everytime a Message is send.
    */
    public onMessage() : void {
        this.client.on('message', (msg) => {

            let content : string = msg.content;
            let author : GuildMember | null = msg.member;

            if (author?.id != this.client?.user?.id && content.startsWith(this.config.prefix)){
                let command : string = content.split(' ')[0].substr(this.config.prefix.length);
                let args : string[] = content.split(' ').slice(1);

                if (!this.commands.has(command)) {
                    console.log("not found..")
                    return;
                }

                try {
                   
                    this.commands.get(command)?.execute(msg, args, this.client);
                      
                } catch (error) {
                    console.error(error);
                    msg.reply('there was an error trying to execute that command!');
                }
                
            }
            
        })
    }
}