import express from 'express';
import { config } from 'dotenv';
config();

import { handler } from './build/handler.js';

const app = express();
app.use(handler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});

