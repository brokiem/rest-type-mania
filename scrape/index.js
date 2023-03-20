import fetch from "node-fetch";
import * as cheerio from "cheerio";
import wordList from "./word_list.js";
import * as fs from "fs";

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchSentences = async (word) => {
    try {
        const response = await fetch(`https://www.wordhippo.com/what-is/sentences-with-the-word/${word}.html`);
        const html = await response.text();

        const $ = cheerio.load(html);
        return $('td[id^="exv2st"]').map((i, el) => $(el).text().replaceAll('’', '\'').trim()).get();
    } catch (error) {
        console.log(`Failed to fetch sentences for ${word}, error: ${error}`);
        return [];
    }
}

const fetchSentencesWithWords = (words) => {
    const promises = [];

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        promises.push(fetchSentences(word));
    }

    return promises;
}

const MAX_RETRIES = 3;

function fetchData() {
    const failedWords = [];
    const data = [];

    function fetchSentences(words, retryCount = 0) {
        const promises = fetchSentencesWithWords(words);

        console.log(`Fetching sentences for ${wordList.length} words...`);

        return Promise.all(promises).then((results) => {
            for (let i = 0; i < results.length; i++) {
                const word = words[i];
                const sentences = results[i];

                if (sentences.length <= 0) {
                    failedWords.push(word);
                    continue;
                }

                data.push({
                    word,
                    sentences
                });
            }

            if (failedWords.length > 0 && retryCount < MAX_RETRIES) {
                console.log(`Retrying ${failedWords.length} failed words...`);
                return fetchSentences(failedWords, retryCount + 1);
            }

            return data;
        });
    }

    return fetchSentences(wordList)
        .then((data) => {
            console.log(`Writing data to file...`);
            fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
        });
}

fetchData();
