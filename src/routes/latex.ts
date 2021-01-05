import crypto from 'crypto';
import type express from 'express'

export default (req: express.Request, res: express.Response) => {
  const { body } = req;
  console.log(body)
  res.statusCode = 200;
  res.end('success')
}