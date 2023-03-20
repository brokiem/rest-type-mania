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

async function fetchData() {
    const data = JSON.parse(fs.readFileSync("./data.json").toString()); // read existing data from file

    const newWords = wordList.filter(word => !data.some(item => item.word === word)); // filter words that don't exist in data

    for (let i = 0; i < newWords.length; i++) {
        const word = newWords[i];

        console.log(`Fetching sentences for ${word} (${i + 1}/${newWords.length})...`);

        let sentences;

        try {
            sentences = await fetchSentences(word);
            await sleep(10);
        } catch (e) {
            console.log(`Failed to fetch sentences for ${word}`);
            continue;
        }

        if (sentences && sentences.length > 0) {
            data.push({
                word,
                sentences
            });
        } else {
            console.log(`Writing data to file...`);
            fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

            process.exit(0);
        }
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
