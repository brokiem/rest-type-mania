import fetch from "node-fetch";
import * as cheerio from "cheerio";
import wordList from "./word_list.js";
import * as fs from "fs";

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchSentences = async (word) => {
    const response = await fetch(`https://www.wordhippo.com/what-is/sentences-with-the-word/${word}.html`);
    const html = await response.text();

    const $ = cheerio.load(html);
    return $('td[id^="exv2st"]').map((i, el) => $(el).text().replaceAll('’', '\'').trim()).get();
}

const MAX_RETRIES = 10;

async function fetchData() {
    const data = [];
    const failedWords = [];

    for (let i = 0; i < wordList.length; i++) {
        const word = wordList[i];

        console.log(`Fetching sentences for ${word} (${i + 1}/${wordList.length})...`);

        let sentences;
        let retryCount = 0;

        do {
            try {
                sentences = await fetchSentences(word);
                break;
            } catch (error) {
                console.log(`Failed to fetch sentences for ${word}. Retrying in 5 seconds...`);

                await sleep(5000);

                if (++retryCount > MAX_RETRIES) {
                    console.log(`Maximum retry count exceeded for ${word}. Skipping...`);
                    failedWords.push(word);
                    break;
                }
            }
        } while (true);

        if (sentences && sentences.length > 0) {
            data.push({
                word,
                sentences
            });
        } else {
            console.log(`No sentences found for ${word}`);
        }
    }

    if (failedWords.length > 0) {
        console.log(`Retrying ${failedWords.length} failed words...`);
        const retryData = await fetchData(failedWords);
        data.push(...retryData);
    }

    console.log(`Writing data to file...`);
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

fetchData();

// const MAX_RETRIES = 3;
//
// function fetchData() {
//     const failedWords = [];
//     const data = [];
//
//     function fetchSentencesData(words, retryCount = 0) {
//         const promises = fetchSentencesWithWords(words);
//
//         return Promise.all(promises).then((results) => {
//             for (let i = 0; i < results.length; i++) {
//                 const word = words[i];
//                 const sentences = results[i];
//
//                 if (sentences.length <= 0) {
//                     failedWords.push(word);
//                     continue;
//                 }
//
//                 data.push({
//                     word,
//                     sentences
//                 });
//             }
//
//             if (failedWords.length > 0 && retryCount < MAX_RETRIES) {
//                 console.log(`Retrying ${failedWords.length} failed words...`);
//                 return fetchSentencesData(failedWords, retryCount + 1);
//             }
//
//             return data;
//         });
//     }
//
//     return fetchSentencesData(wordList).then((data) => {
//         if (data.length > 0) {
//             console.log(`Writing data to file...`);
//             fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
//         } else {
//             console.log(`No data to write to file.`);
//         }
//     });
// }
//
// console.log(`Fetching sentences for ${wordList.length} words...`);
//
// fetchData();
