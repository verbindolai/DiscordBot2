
import discord, { Channel, Client, Collection, Guild, GuildMember, Message, TextChannel } from 'discord.js';
import fs from 'fs';
import { commandInterface } from "./interface/commandInterface";
import { getNewestPosts } from "./lib/garry"
import { startLessonTimers } from './lib/timetable';
import parseISO from 'date-fns/parseISO'
export const MAIN_SERVER_ID = "688839065663176738";
export const GARRY_CHANNEL = "858319309319307274";

export class Bot {

    private readonly client: Client;
    private config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    private readonly commands: discord.Collection<string, commandInterface>;

    constructor() {
        this.client = new discord.Client;
        this.commands = new discord.Collection();
        this.addComms();
    }

    /*
    Adds all Command-Instances from the Command-Classes in the "commands"-Directory to the Command-Map
    */
    private addComms(): void {
        const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const fileWithoutTS = file.replace(".ts", "");
            let command: commandInterface = require(`./commands/${fileWithoutTS}`);
            this.commands.set(command.name, command);
        }
        console.log("Active Commands: \n")
        console.log(this.commands);
    }

    /*
    Logs the Bot in with the Token and starts the Event-Listening / Evént-Handling
    */
    public start(): void {
        this.login();
        this.onReady();
        this.onMemberUpdate();
        this.onMessage();
    }

    private login() {
        this.client.login(this.config.token).then(r => { console.log('Logged in successfully.') }).catch((e) => {
            console.log(e);
            setTimeout(() => {
                console.log('Tryjng login again...')
                this.login();
            }, 60 * 1000);
        });
    }

    /*
    On Ready Event
    */
    private onReady(): void {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this?.client?.user?.username}...`)
            startLessonTimers(this.client);
            getNewestPosts(this.client)

            setInterval(() => {
                getNewestPosts(this.client)
            }, 45 * 60000)
        });
    }

    /*
    On GuildMember Update Event i.e. role or nickname change
    */
    private onMemberUpdate(): void {
        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
        })
    }

    /*
   On Message Event, get triggered everytime a Message is send.
   */
    private onMessage(): void {
        this.client.on('message', (msg) => {

            let content: string = msg.content;
            let author: GuildMember | null = msg.member;

            if (author?.id != this.client?.user?.id && content.startsWith(this.config.prefix)) {
                let command: string = content.split(' ')[0].substr(this.config.prefix.length);
                let args: string[] = content.split(' ').slice(1);

                if (!this.commands.has(command)) {
                    console.log("not found..")
                    return;
                }

                try {
                    this.commands.get(command)?.execute(msg, args, this.client);

                } catch (error) {
                    console.error(error);
                    msg.reply('there was an error trying to execute that command!').then(r => { }).catch(c => { });
                }

            }

        })
    }

}
