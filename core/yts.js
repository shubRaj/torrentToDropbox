import fetch from 'node-fetch';
class YTS {
    _BASE = "https://yts.mx/api/v2/list_movies.json?sort_by=download_count&quality=720p&minimum_rating=5&page=";
    constructor() {
        this._p = 1;
    }
    async *get_topseeds(year = 1990) {
        while (true) {
            let response = await fetch(`${this._BASE}${this._p}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0"
                }
            });
            let json_response = await response.json();
            let movies = json_response.data.movies;
            if (movies.length == 0) return;
            movies = movies.filter(movie => movie.year <= year);
            for (let movie of movies) yield movie;
            this._p++;
        }
    }
}
const yts = new YTS();
const get_topseeds = yts.get_topseeds();
export { get_topseeds as topseeds };