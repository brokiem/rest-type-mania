import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono();

app.use(cors());

app.get('/', (c) => c.html('Hello World!'));

export default app;
