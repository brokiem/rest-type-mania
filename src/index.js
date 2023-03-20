import app from './app.js';
import randomWords from 'random-words';
import * as fs from "fs";

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

function getSentences(word) {
    const wordObj = data.find(obj => obj.word === word);
    return wordObj ? wordObj.sentences : [];
}

app.get('/sentence', async (req, res) => {
    const word = randomWords(1);

    const fetchSentence = async () => {
        const sentences = getSentences(word);

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
        const sentences = getSentences(word);

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
