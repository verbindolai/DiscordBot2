import * as cheerio from 'cheerio'
import fs from 'fs';
import { GARRY_CHANNEL, MAIN_SERVER_ID } from '../bot';
import discord, { Client, Guild, TextChannel } from 'discord.js';
import { request } from './comm';

const similarity = require('./stringSimilarity')


const URL = "https://gharaei.de/en/";
const POST_HTML_CONTAINER_NAME = '.entry-content';
const HEADER_SELECTOR = '2021]'

export const sayWords = ['erzählt', 'teilt mit', 'schreit', 'denkt', 'singt', 'plaudert', 'informiert', 'sagt', 'schildert', 'präsentiert', 'beklagt', 'piept', 'brummt', 'verrät', 'morst', 'jodelt'];
export const endings = ['während er seine Zähne putzt', 'während er Yoga macht', 'während er die Wäsche aufhängt', 'während er Hardware inspiziert', 'während er schläft', 'während er auf dem Mond fliegt', 'während er Kobolde jagd', 'während er verträumt in die Wolken blickt', 'während er druch einen düsteren Wald rennt']


export interface Post {
    date: string;
    message: string
}

/**
 * Returns a Promise to an Post-Array of all Posts.
 */

export function getPosts(): Promise<Post[]> {
    console.log('Fetching all Post...')

    let pageHTMLString = request(URL);

    let textArr: Promise<string[]> = pageHTMLString.then((htmlString) => {
        const cheer = cheerio.load(htmlString);
        return htmlToTextArr(cheer, POST_HTML_CONTAINER_NAME);
    })

    let posts: Promise<Post[]> = textArr.then((arr) => {
        const postArr: Post[] = [];
        let date = ""
        let message = ""
        for (let i = 0; i < arr.length; i++) {
            const content = arr[i]
            if (content == null || content == undefined) {
                continue;
            }
            if (content.includes(HEADER_SELECTOR)) {
                if (i > 0) {
                    const post: Post = { date: date, message: message }
                    postArr.push(post)
                    date = "";
                    message = "";
                }
                date = content;
            } else {
                message += content;
            }
            if (i + 1 === arr.length) {
                const post: Post = { date: date, message: message }
                postArr.push(post)
                date = "";
                message = "";
            }
        }
        console.log(`Found ${postArr.length} posts.`)
        return postArr;
    })
    console.log('Returning fetched posts.')
    return posts;
}

/**
 * Gets a Cheerio-HTML-Object and a HTML-Selector and returns a Array of the Text-Elements inside all children of the selected container.
 * @param cheer
 */
function htmlToTextArr(cheer: any, selector: string): string[] {
    let posts: string[] = [];
    cheer(selector).children().each(function (i: number, e: any) {
        posts[i] = cheer(e).text();
    });
    return posts;
}

/**
 * Gets the newest Posts and sends them to the right Channel.
 */
export function getNewestPosts(client: Client) {
    const posts = getPosts()
    const writeFile = posts.then(result => fs.promises.writeFile('src/other/posts.json', JSON.stringify(result)))
    const savedPosts: Promise<Post[]> = fs.promises.readFile('src/other/posts.json').then((buffer: any) => JSON.parse(buffer.toString()))

    const diff = Promise.all([posts, savedPosts, writeFile]).then((result) => {
        return getDiff(result[0], result[1])
    })


    diff.then((result) => {

        if (result.length == 0) {
            return;
        }
        client.guilds.fetch(MAIN_SERVER_ID).then((guild) => {
            const channel = (guild.channels.cache.find(ch => { return ch.id === GARRY_CHANNEL && ch.type === 'text' }) as TextChannel);
            for (let post of result) {
                const message = createGarryEmbed(post);
                channel.send(message)
            }
        })
    })
}

function createGarryEmbed(post: Post) {
    const message = new discord.MessageEmbed();
    message.setAuthor(`Garry ${sayWords[Math.floor(Math.random() * sayWords.length)]} ...`)
    message.setURL('https://gharaei.de/en/')
    message.setColor(1752220)
    message.description = post.message + `\n\n**... ${endings[Math.floor(Math.random() * endings.length)]}.**`;
    message.setTitle(post.date)
    message.setFooter('Scraped ')
    message.setTimestamp()
    return message;
}



function getDiff(a: Post[], b: Post[]): Post[] {
    const result = [];
    for (let aElement of a) {
        let add = true;
        for (let bElement of b) {
            const contentSimilarity = aElement.message.similarity(bElement.message);
            if (contentSimilarity) {
                if (aElement.date === bElement.date && contentSimilarity > 0.95) {
                    add = false;
                    break;
                }
            }
        }
        if (add) {
            result.push(aElement)
        }
    }
    return result;
}




