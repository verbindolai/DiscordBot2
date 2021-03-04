
import discord, {Channel, Client, Collection, Guild, GuildMember, Message, TextChannel} from 'discord.js';
import fs, {writeFileSync} from 'fs';
import {commandInterface} from "./commandInterface";
import {run} from "./garryScraper"
export class Bot{

    private readonly client : Client;
    private config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    private readonly commands: discord.Collection<string, commandInterface>;
    private static readonly words : string[] = ['erzählt', 'teilt mit', 'schreit', 'denkt', 'singt', 'plaudert', 'informiert', 'sagt', 'schildert', 'präsentiert']
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
            let command : commandInterface = require(`./commands/${fileWithoutTS}`);
            this.commands.set(command.name, command);
        }
        console.log("Active Commands: \n")
        console.log(this.commands);
    }

    /*
    Logs the Bot with the Token in and starts the Event-Listening / Evént-Handling
    */
    public start (): void {
        this.client.login(this.config.token).then(r => {});
        this.onReady();
        this.onMemberUpdate();
        this.onMessage();
    }

    /*
    On Ready Event
    */
    private onReady() : void {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this?.client?.user?.username}...`)
            //this.timeTableNotify()
            this.getNewestGarryPost()

            setInterval(() => {
                this.getNewestGarryPost()
            },30 * 60000)
        });
    }

    private readFilePromise(path : string){
        return new Promise((resolve, reject) => {
            fs.readFile(path, (e, r) => {
                if (e){
                    return reject(e)
                } else {
                    return resolve(r)
                }
            });
        })
    }

    private getDiff (a : {date:"",message:""}[], b : {date:"",message:""}[]) : {date:"",message:""}[]{
        const result = [];
        for (let aElement of a){
            let add = true;
            for (let bElement of b){
                if (aElement.date === bElement.date && aElement.message === bElement.message){
                    add = false;
                    break;
                }
            }
            if (add){
                result.push(aElement)
            }
        }
        return result;
    }

    private  getNewestGarryPost(){
        let diff = this.readFilePromise('src/posts.json')
            .then((buffer : any) => JSON.parse(buffer.toString()))
            .then(result => {
                return run().then((posts : any) => {
                    let diff = this.getDiff(posts, result)
                    writeFileSync('src/posts.json', JSON.stringify(posts))
                    return diff;

                })
            })
        diff.then(async (result) => {
            console.log(result)
            if (result.length == 0){
                return;
            }
            const guild = await this.client.guilds.fetch("688839065663176738")
            const channel = (guild.channels.cache.find(ch => {return ch.id === '811224489815048212' && ch.type === 'text'}) as TextChannel);

            for (let post of result){
                let message = new discord.MessageEmbed();
                message.setAuthor(`Garry ${Bot.words[Math.floor(Math.random() * Bot.words.length)]}:`)
                message.setURL('https://gharaei.de/en/')
                message.setColor(10038562)
                message.description = post.message;
                message.setTitle(post.date)
                message.setFooter('Scraped ')
                message.setTimestamp()
                await channel.send(message)
            }
        })
    }


    private async timeTableNotify(){
        let data = fs.readFileSync('src/timeTableMISS20.json')
        let timeTable = JSON.parse(data.toString())
        let guild = await this.client.guilds.fetch("688839065663176738")
        let channelMng = guild.channels;
        for (let modul of timeTable){
            let currentTime = new Date();
            let timeDiff = modul.utcStart - (currentTime.getTime() + 300000);
            if (timeDiff < 2000000000 && timeDiff >= 0){ //
                let message = new discord.MessageEmbed();
                let channel : TextChannel | undefined = undefined;
                channelMng.cache.forEach((guildChannel)=> {
                    if (guildChannel.type === "text" && this.checkMatch(modul.name, guildChannel.name)) {
                        channel = (guildChannel as TextChannel)
                        message.setColor('#0099ff')
                        message.setAuthor('Stundenplan')
                        message.setTitle(`${modul.name}`)
                        message.description = 'Diese Veranstaltung beginnt in 5 Minuten.'
                        message.addFields(

                                { name: 'Professor', value: modul.prof, inline: true },
                                { name: 'Dauer', value: (modul.utcEnd - modul.utcStart) / (1000 * 60) + " Minuten", inline: true },
                                { name: 'Raum', value: modul.room, inline: true },
                            )
                        message.setTimestamp(new Date(modul.utcStart))
                    }
                })
               if (channel != undefined){
                   setTimeout(() => {
                       if(channel != undefined){
                           channel.send(message)
                       }
                   }, timeDiff)
               }
            }
        }
    }

    /*
    On GuildMember Update Event i.e. role or nickname change
    */
    private onMemberUpdate() : void {
        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
        })
    }

     /*
    On Message Event, get triggered everytime a Message is send.
    */
    private onMessage() : void {
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
                    this.commands.get(command)?.ex.execute(msg, args, this.client);

                } catch (error) {
                    console.error(error);
                    msg.reply('there was an error trying to execute that command!').then(r => {}).catch(c => {});
                }

            }

        })
    }

    private checkMatch(a : String, b : String){
        let result = true;
        let bArr = b.split('-');
        for (let string of bArr){
            if (a.toUpperCase().match(string.toUpperCase()) == null){
                result = false;
                break;
            }
        }
        return result
    }
}
