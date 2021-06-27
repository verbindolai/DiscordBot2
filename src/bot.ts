
import discord, { Channel, Client, Collection, Guild, GuildMember, Message, TextChannel } from 'discord.js';
import fs from 'fs';
import { commandInterface } from "./interface/commandInterface";
import { getNewestPosts } from "./lib/garry"
import { getLessonsForDay } from './lib/timetable';
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
        getLessonsForDay(parseISO("2021-06-03")).then(res => console.log(res))
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
    Logs the Bot with the Token in and starts the Event-Listening / Evént-Handling
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
            //this.timeTableNotify()
            getNewestPosts(this.client)

            setInterval(() => {
                getNewestPosts(this.client)
            }, 45 * 60000)
        });
    }

    /**
     * Sends a message shortly before a module starts to the fitting channel.
     * @private
     */
    private async timeTableNotify() {
        const MAX_TIMEOUT = 2000000000;
        const FIVETEEN_MIN_IN_MILLIS = 900000;

        let data = fs.readFileSync('src/timeTableMISS20.json')
        let timeTable = JSON.parse(data.toString())
        let guild = await this.client.guilds.fetch(MAIN_SERVER_ID)
        let channelMng = guild.channels;

        for (let modul of timeTable) {
            let currentTime = new Date();
            let timeDiff = modul.utcStart - 7200000 - (currentTime.getTime() + FIVETEEN_MIN_IN_MILLIS);

            if (timeDiff < MAX_TIMEOUT && timeDiff >= 0) { //
                console.log(`Modul: ${modul.name} starting in ${timeDiff}`)
                console.log(modul.utcStart - 7200000)

                let message = new discord.MessageEmbed();

                message.setColor('#0099ff')
                message.setAuthor('Stundenplan')
                message.setTitle(`${modul.name}`)
                message.description = 'Diese Veranstaltung beginnt in 15 Minuten.'
                message.addFields(

                    { name: 'Professor', value: modul.prof, inline: true },
                    { name: 'Dauer', value: (modul.utcEnd - modul.utcStart) / (1000 * 60) + " Minuten", inline: true },
                    { name: 'Raum', value: modul.room, inline: true },
                )
                message.setTimestamp(new Date(modul.utcStart - 7200000))

                channelMng.cache.forEach((guildChannel) => {
                    let channel: TextChannel | undefined = undefined;
                    if (guildChannel.type === "text" && this.checkMatch(modul.name, guildChannel.name)) {
                        channel = (guildChannel as TextChannel)
                    }
                    if (channel != undefined) {
                        setTimeout(() => {
                            if (channel != undefined) {
                                channel.send(message)
                            }
                        }, timeDiff)
                    }
                })

            }
        }
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

    private checkMatch(a: String, b: String) {
        let result = true;
        let bArr = b.split('-');
        for (let string of bArr) {
            if (a.toUpperCase().match(string.toUpperCase()) == null) {
                result = false;
                break;
            }
        }
        return result
    }
}
