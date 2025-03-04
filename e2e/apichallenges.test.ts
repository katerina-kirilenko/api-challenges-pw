import { test, expect } from '@playwright/test';
import { URLs, TODO, WRONG_TODO } from '../src/enums';

/** The API Challenges */

test.describe('First Real Challenge', { tag: '@GET/challenges' }, () => {
  test('02 Issue a GET request on the `/challenges` end point', async ({ request }) => {
    const response = await request.get(URLs.CHALLENGES);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.challenges.length).toBe(59);
  });
});

test.describe('GET Challenges', { tag: '@GET/todo(s)' }, () => {
  test('03 Issue a GET request on the `/todos` end point', async ({ request }) => {
    const response = await request.get(URLs.TODOS);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.todos.length).toBe(10);
  });

  test('04 Issue a GET request on the `/todo` end point should 404 because nouns should be plural', async ({
    request,
  }) => {
    const response = await request.get(URLs.TODO);

    expect(response.status()).toBe(404);
  });

  test('05 Issue a GET request on the `/todos/{id}` end point to return a specific todo', async ({ request }) => {
    const todoId = 1;
    const response = await request.get(`${URLs.TODOS}/${todoId}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.todos[0].id).toBe(todoId);
  });

  test('06 Issue a GET request on the `/todos/{id}` end point for a todo that does not exist', async ({ request }) => {
    const todoId = 12;
    const response = await request.get(`${URLs.TODOS}/${todoId}`);
    const body = await response.json();

    expect(response.status()).toBe(404);
    expect(body.errorMessages[0]).toBe(`Could not find an instance with todos/${todoId}`);
  });

  test('07 Issue a GET request on the `/todos` end point with a query filter to get only todos which are `done`', async ({
    request,
  }) => {
    await request.post(URLs.TODOS, { data: TODO });

    const response = await request.get(`${URLs.TODOS}?doneStatus=true`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.todos.every((todo: { doneStatus: boolean }) => todo.doneStatus)).toBeTruthy();
  });
});

test.describe('HEAD Challenges', { tag: '@HEAD/todos' }, () => {
  test('08 Issue a HEAD request on the `/todos` end point', async ({ request }) => {
    const response = await request.head(URLs.TODOS);

    expect(response.status()).toBe(200);
    expect(response.headers()['x-challenger']).toBeTruthy();
  });
});

test.describe('Creation Challenges with POST', { tag: '@POST/todos' }, () => {
  test('09 Issue a POST request to successfully create a todo', async ({ request }) => {
    const response = await request.post(URLs.TODOS, { data: TODO });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.title).toBe(TODO.title);
  });

  test('10 Issue a POST request to create a todo but fail validation on the `doneStatus` field', async ({
    request,
  }) => {
    const response = await request.post(URLs.TODOS, { data: WRONG_TODO });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe('Failed Validation: doneStatus should be BOOLEAN but was STRING');
  });
});
