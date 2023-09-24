import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => c.redirect('https://typerx.vercel.app'));

export default app;
