import fetch from "node-fetch";
import * as cheerio from "cheerio";
import wordList from "./word_list.js";
import * as fs from "fs";

const fetchSentences = async (word) => {
    const response = await fetch(`https://www.wordhippo.com/what-is/sentences-with-the-word/${word}.html`);
    const html = await response.text();

    const $ = cheerio.load(html);
    return $('td[id^="exv2st"]').map((i, el) => $(el).text().replaceAll('’', '\'').trim()).get();
}

const data = [];
const promises = [];

for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];

    console.log(`Fetching sentences for word: ${word} (${i + 1}/${wordList.length})`);

    promises.push(fetchSentences(word));
}

Promise.all(promises).then((results) => {
    for (let i = 0; i < results.length; i++) {
        const word = wordList[i];
        const sentences = results[i];

        data.push({
            word,
            sentences
        });
    }
});

fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
