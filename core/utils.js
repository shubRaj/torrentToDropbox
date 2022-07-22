import { topseeds } from './yts.js';
import { WebTorClient } from './webtor.js';
import * as fs from 'node:fs/promises';
const client = new WebTorClient();
async function addQueue() {
    try {
        let movie = (await topseeds.next()).value;
        let content = await fs.readFile("uploaded.txt", "utf8");
        let uploads = content.split("\n");
        if (uploads.includes(movie.imdb_code)) {
            addQueue();
        } else {
            await fs.appendFile("uploaded.txt", `${movie.imdb_code}\n`);
            client.addMagnet(`magnet:?xt=urn:btih:${movie.torrents[0].hash}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce`);
        }

    }
    catch (err) {
        if (err.code == "ENOENT") {
            await fs.writeFile("uploaded.txt", "");
        }
        addQueue();
    }
}
export default addQueue;