import { request } from '@playwright/test';
import * as dotenv from 'dotenv';
import { URLs } from './types';

dotenv.config();

async function globalSetup() {
  const requestContext = await request.newContext({
    baseURL: process.env.BASE_URL,
  });

  const response = await requestContext.post(URLs.CHALLENGER);
  const headers = response.headers();
  const GUID = headers['x-challenger'];

  process.env.GUID = GUID;
  console.log('01 [GUID]', GUID);
}

export default globalSetup;
