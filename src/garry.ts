import * as https from 'https';
import * as cheerio from 'cheerio'

const URL = "https://gharaei.de/en/";
const POST_HTML_CONTAINER_NAME = '.entry-content';
const HEADER_SELECTOR = '2021]'

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
                    const post: Post = {date: date, message: message}
                    postArr.push(post)
                    date = "";
                    message = "";
                }
                date = content;
            } else {
                message += content;
            }
            if (i + 1 === arr.length) {
                const post: Post = {date: date, message: message}
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
function htmlToTextArr(cheer: any, selector : string): string[] {
    let posts: string[] = [];
    cheer(selector).children().each(function (i: number, e: any) {
        posts[i] = cheer(e).text();
    });
    return posts;
}

/**
 * Makes a GET-Request to given URL and returns Response-String
 * @param url
 */
function request(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            https.get(url, (resp) => {
                let data = '';

                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    return resolve(data)
                });

            }).on("error", (err) => {
                return reject(err)
            });
        } catch (e) {
            return reject(e)
        }
    })
}

