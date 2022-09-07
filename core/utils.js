import { WebTorClient } from './webtor.js';
import * as fs from 'node:fs/promises';
const client = new WebTorClient();
async function* get_series() {
    let to_upload = await fs.readFile("./to_upload.txt", "utf8");
    for (let serie of to_upload.split("\n")) {
        yield serie
    }
}
let series = get_series()
async function addQueue() {
    let serie = (await series.next());
    if (!serie.done) {
        try {
            let uploaded_series = (await fs.readFile("./uploaded.txt", "utf8")).split("\n");
            if (!uploaded_series.includes(serie.value)) {
                client.addMagnet(`magnet:?xt=urn:btih:${serie.value}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce`);
                await fs.appendFile("./uploaded.txt", `${serie.value}\n`);
            }
        }
        catch (err) {
            if (err.code == "ENOENT") {
                await fs.writeFile("./uploaded.txt", "");
            }
            await addQueue();
        }
    }

}
export default addQueue;