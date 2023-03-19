import app from './app.js';
import randomWords from 'random-words';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

app.get('/sentence', async (req, res) => {
    const word = randomWords(1);

    const fetchSentence = async () => {
        const response = await fetch(`https://www.wordhippo.com/what-is/sentences-with-the-word/${word}.html`);
        const html = await response.text();

        const $ = cheerio.load(html);
        const sentences = $('td[id^="exv2st"]').map((i, el) => $(el).text().replaceAll('’', '\'').trim()).get();

        if (sentences.length <= 0) {
            return fetchSentence();
        }

        return sentences[Math.floor(Math.random() * sentences.length)];
    }

    const sentence = await fetchSentence();

    res.json({
        error: false,
        message: sentence
    });
});

app.get('/sentences/:count', async (req, res) => {
    const count = req.params.count;

    const word = randomWords(1);

    const fetchSentences = async () => {
        const response = await fetch(`https://www.wordhippo.com/what-is/sentences-with-the-word/${word}.html`);
        const html = await response.text();

        const $ = cheerio.load(html);
        const sentences = $('td[id^="exv2st"]').map((i, el) => $(el).text().replaceAll('’', '\'').trim()).get();

        if (sentences.length <= 0) {
            return fetchSentences();
        }

        sentences.length = count > sentences.length ? sentences.length : count;

        return sentences;
    }

    const sentences = await fetchSentences();

    res.json({
        error: false,
        message: sentences
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening to http://127.0.0.1:${port}`);
});
