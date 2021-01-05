import express from 'express';
import latex from './routes/latex';
import { json } from 'body-parser';
import helmet from 'helmet';
require('dotenv').config();

const app = express();
const port = 3987;

app
  .use(json())
  .use(helmet())

app.post('/latex', latex);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
});


  // joHcpGMRXur6+bfwx/BV1yKRsCAliyrELWJtFinO46k=