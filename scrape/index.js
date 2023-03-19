import fetch from "node-fetch";
import * as cheerio from "cheerio";
import randomWords from "random-words";
const {wordsList} = randomWords;
import * as fs from "fs";

const fetchSentences = async (word) => {
    const response = await fetch(`https://www.wordhippo.com/what-is/sentences-with-the-word/${word}.html`);
    const html = await response.text();

    const $ = cheerio.load(html);
    return $('td[id^="exv2st"]').map((i, el) => $(el).text().replaceAll('’', '\'').trim()).get();
}

const data = [];

for (let i = 0; i < wordsList.length; i++) {
    const word = wordsList[i];

    console.log(`Fetching sentences for word: ${word} (${i + 1}/${wordsList.length})`);

    const sentences = await fetchSentences(word);

    data.push({
        word,
        sentences
    });
}

fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
