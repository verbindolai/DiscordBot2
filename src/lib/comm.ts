import * as https from 'https';

/**
 * Makes a GET-Request to given URL and returns Response-String
 * @param url
 */
export function request(url: string): Promise<string> {
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