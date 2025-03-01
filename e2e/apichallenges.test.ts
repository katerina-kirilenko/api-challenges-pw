import { test, expect } from '@playwright/test';
import { URLs } from '../src/enums/urls.const';

test.describe.only('The API Challenges', () => {
  test.describe('First Real Challenge', { tag: '@GET/challenges' }, () => {
    test('Получить список испытаний', async ({ request }) => {
      const response = await request.get(URLs.CHALLENGES);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.challenges.length).toBe(59);
    });
  });

  test.describe('GET Challenges', { tag: '@GET/todo(s)' }, () => {
    test('Получить список задач', async ({ request }) => {
      const response = await request.get(URLs.TODOS);
      const body = await response.json();
      // console.log('body', body);

      expect(response.status()).toBe(200);
      expect(body.todos.length).toBe(10);
    });
  });
});
