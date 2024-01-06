import app from './app.js';
import * as fs from "fs";

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

app.get('/sentence', async (c) => {
    const fetchSentence = async () => {
        const object = data[Math.floor(Math.random() * data.length)];
        const sentences = object.sentences;

        return sentences[Math.floor(Math.random() * sentences.length)];
    }

    const sentence = await fetchSentence();

    return c.json({
        error: false,
        message: sentence
    });
});

app.get('/sentences/:count', async (c) => {
    const {count} = c.req.param();

    const fetchSentences = async () => {
        const object = data[Math.floor(Math.random() * data.length)];
        const sentences = object.sentences;

        if (count === 1) {
            return sentences[Math.floor(Math.random() * sentences.length)];
        } else {
            sentences.length = count > sentences.length ? sentences.length : count;
        }

        return sentences;
    }

    const sentences = await fetchSentences();

    return c.json({
        error: false,
        message: sentences
    });
});

const port = process.env.PORT || 5000;

Bun.serve({
    port: port,
    fetch: app.fetch,
});
