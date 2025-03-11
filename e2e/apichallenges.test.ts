import { test, expect, request } from '@playwright/test';
import {
  URLs,
  TODO,
  longTitle,
  ErrorMessage,
  longDescription,
  extraLongString,
  contentTypes,
  xmlBody,
} from '../src/types';
import { v4 as uuidv4 } from 'uuid';

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
    expect(body.errorMessages[0]).toBe(ErrorMessage.todoNotFound(todoId));
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
    const response = await request.post(URLs.TODOS, { data: { ...TODO, doneStatus: 'true' } });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe('Failed Validation: doneStatus should be BOOLEAN but was STRING');
  });

  test('11 Issue a POST request to create a todo but fail length validation on the `title` field because your title exceeds maximum allowable characters', async ({
    request,
  }) => {
    const response = await request.post(URLs.TODOS, {
      data: {
        ...TODO,
        title: longTitle,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe(ErrorMessage.tooLongTitle);
  });

  test('12 Issue a POST request to create a todo but fail length validation on the `description` because your description exceeds maximum allowable characters', async ({
    request,
  }) => {
    const response = await request.post(URLs.TODOS, {
      data: {
        ...TODO,
        description: longDescription,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe(ErrorMessage.tooLongDescription);
  });

  test('13 Issue a POST request to create a todo with maximum length title and description fields.', async ({
    request,
  }) => {
    const response = await request.post(URLs.TODOS, {
      data: {
        ...TODO,
        title: longTitle.slice(0, 50),
        description: longDescription.slice(0, 200),
      },
    });
    const { title, description } = await response.json();

    expect(response.status()).toBe(201);
    expect(title.length).toBe(50);
    expect(description.length).toBe(200);
  });

  test('14 Issue a POST request to create a todo but fail payload length validation on the `description` because your whole payload exceeds maximum allowable 5000 characters.', async ({
    request,
  }) => {
    const response = await request.post(URLs.TODOS, {
      data: {
        ...TODO,
        description: extraLongString,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(413);
    expect(body.errorMessages[0]).toBe(ErrorMessage.extraLong);
  });

  test('15 Issue a POST request to create a todo but fail validation because your payload contains an unrecognised field.', async ({
    request,
  }) => {
    const response = await request.post(URLs.TODOS, {
      data: {
        ...TODO,
        priority: 'warn',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe(ErrorMessage.wrongField('priority'));
  });
});

test.describe('Creation Challenges with PUT', { tag: '@PUT/todos' }, () => {
  test('16 Issue a PUT request to unsuccessfully create a todo', async ({ request }) => {
    const response = await request.put(`${URLs.TODOS}/99`, { data: TODO });

    expect(response.status()).toBe(400);
  });
});

test.describe('Update Challenges with POST', { tag: '@POST/todos/{id}' }, () => {
  test('17 Issue a POST request to successfully update a todo', async ({ request }) => {
    const response = await request.post(`${URLs.TODOS}/1`, { data: TODO });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.title).toBe(TODO.title);
  });

  test('18 Issue a POST request for a todo which does not exist. Expect to receive a 404 response.', async ({
    request,
  }) => {
    const todoId = 99;

    const response = await request.post(`${URLs.TODOS}/${todoId}`, { data: TODO });
    const body = await response.json();

    expect(response.status()).toBe(404);
    expect(body.errorMessages[0]).toBe(ErrorMessage.wrongTodoId(todoId));
  });
});

test.describe('Update Challenges with PUT', { tag: '@PUT/todos/{id}' }, () => {
  const todoId = 1;

  test('19 Issue a PUT request to update an existing todo with a complete payload i.e. title, description and donestatus.', async ({
    request,
  }) => {
    const response = await request.put(`${URLs.TODOS}/${todoId}`, { data: TODO });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.title).toBe(TODO.title);
  });

  test('20 Issue a PUT request to update an existing todo with just mandatory items in payload i.e. title.', async ({
    request,
  }) => {
    const newTitle = 'New title';

    const updateTodo = await request.put(`${URLs.TODOS}/${todoId}`, { data: { title: newTitle } });
    const getTodo = await request.get(`${URLs.TODOS}/${todoId}`);
    const { todos } = await getTodo.json();

    expect(updateTodo.status()).toBe(200);
    expect(todos[0].title).toBe(newTitle);
  });

  test('21 Issue a PUT request to fail to update an existing todo because title is missing in payload.', async ({
    request,
  }) => {
    const response = await request.put(`${URLs.TODOS}/${todoId}`, { data: {} });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe(ErrorMessage.mandatoryField);
  });

  test('22 Issue a PUT request to fail to update an existing todo because id different in payload.', async ({
    request,
  }) => {
    const response = await request.put(`${URLs.TODOS}/${todoId}`, { data: { id: 99, ...TODO } });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.errorMessages[0]).toBe(ErrorMessage.amendId);
  });
});

test.describe('DELETE Challenges', { tag: '@DELETE/todos/{id}' }, () => {
  const todoId = 1;

  test('23 Issue a DELETE request to successfully delete a todo', async ({ request }) => {
    const response = await request.delete(`${URLs.TODOS}/${todoId}`);
    const getTodo = await request.get(`${URLs.TODOS}/${todoId}`);
    const body = await getTodo.json();

    expect(response.status()).toBe(200);
    expect(body.errorMessages[0]).toBe(ErrorMessage.todoNotFound(todoId));
  });
});

test.describe('OPTIONS Challenges', { tag: '@OPTIONS/todos' }, () => {
  test("24 Issue an OPTIONS request on the `/todos` end point. You might want to manually check the 'Allow' header in the response is as expected.", async ({
    page,
  }) => {
    const response = await page.request.fetch(URLs.TODOS, {
      method: 'OPTIONS',
    });
    const allowedVerbs = response.headers().allow.split(',');

    expect(response.status()).toBe(200);
    expect(allowedVerbs.length).toBe(4);
  });
});

test.describe('Accept Challenges', { tag: '@Accept' }, () => {
  test('25 Issue a GET request on the `/todos` end point with an `Accept` header of `application/xml` to receive results in XML format', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.xml,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.get(URLs.TODOS);
    const responseXml = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.xml);
    expect(responseXml.includes('<todo>')).toBeTruthy();
  });

  test('26 Issue a GET request on the `/todos` end point with an `Accept` header of `application/json` to receive results in JSON format', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.json,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.get(URLs.TODOS);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(body.todos.length).toBeGreaterThan(1);
  });

  test('27 Issue a GET request on the `/todos` end point with an `Accept` header of `*/*` to receive results in default JSON format', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.any,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.get(URLs.TODOS);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(body.todos.length).toBeGreaterThan(1);
  });

  test('28 Issue a GET request on the `/todos` end point with an `Accept` header of `application/xml, application/json` to receive results in the preferred XML format', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.xml + ',' + contentTypes.json,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.get(URLs.TODOS);
    const responseXml = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.xml);
    expect(responseXml.includes('<todo>')).toBeTruthy();
  });

  test('29 Issue a GET request on the `/todos` end point with no `Accept` header present in the message to receive results in default JSON format', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: '',
        'x-challenger': process.env.GUID || '',
      },
    });
    const response = await requestContext.get(URLs.TODOS);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(body.todos.length).toBeGreaterThan(1);
  });

  test("30 Issue a GET request on the `/todos` end point with an `Accept` header `application/gzip` to receive 406 'NOT ACCEPTABLE' status code", async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.gzip,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.get(URLs.TODOS);

    expect(response.status()).toBe(406);
  });
});

test.describe('Content-Type Challenges', { tag: '@Content-Type' }, () => {
  test('31 Issue a POST request on the `/todos` end point to create a todo using Content-Type `application/xml`, and Accepting only XML ie. Accept header of `application/xml`', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.xml,
        'Content-Type': contentTypes.xml,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.post(URLs.TODOS, { data: xmlBody });
    const responseXml = await response.text();

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toBe(contentTypes.xml);
    expect(responseXml.includes('file paperwork today')).toBeTruthy();
  });

  test('32 Issue a POST request on the `/todos` end point to create a todo using Content-Type `application/json`, and Accepting only JSON ie. Accept header of `application/json`', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.json,
        'Content-Type': contentTypes.json,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.post(URLs.TODOS, { data: TODO });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(body.title).toBe(TODO.title);
  });

  test('33 Issue a POST request on the `/todos` end point with an unsupported content type to generate a 415 status code', async ({}) => {
    const contentType = 'unsupported';
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        'Content-Type': contentType,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.post(URLs.TODOS, { data: TODO });
    const body = await response.json();

    expect(response.status()).toBe(415);
    expect(body.errorMessages[0]).toBe(ErrorMessage.unsupportedContentType(contentType));
  });
});

test.describe('Fancy a Break? Restore your session', { tag: '@Restore' }, () => {
  const challengerUrl = `${URLs.CHALLENGER}/${process.env.GUID}`;

  test('34 Issue a GET request on the `/challenger/{guid}` end point, with an existing challenger GUID. This will return the progress data payload that can be used to later restore your progress to this status.', async ({
    request,
  }) => {
    const response = await request.get(challengerUrl);
    const { challengeStatus } = await response.json();

    expect(response.status()).toBe(200);
    expect(challengeStatus['GET_RESTORABLE_CHALLENGER_PROGRESS_STATUS']).toBeTruthy();
  });

  test("35 Issue a PUT request on the `/challenger/{guid}` end point, with an existing challenger GUID to restore that challenger's progress into memory.", async ({
    request,
  }) => {
    const data = await request.get(challengerUrl);
    const payload = { data: await data.json() };

    const response = await request.put(challengerUrl, payload);
    const { challengeStatus } = await response.json();

    expect(response.status()).toBe(200);
    expect(challengeStatus['PUT_RESTORABLE_CHALLENGER_PROGRESS_STATUS']).toBeFalsy();
  });

  test("36 Issue a PUT request on the `/challenger/{guid}` end point, with a challenger GUID not currently in memory to restore that challenger's progress into memory.", async ({
    request,
  }) => {
    const data = await request.get(challengerUrl);

    const challengerGuid = uuidv4();
    const payload = {
      headers: { 'x-challenger': challengerGuid },
      data: { ...(await data.json()), xChallenger: challengerGuid },
    };

    const response = await request.put(`${URLs.CHALLENGER}/${challengerGuid}`, payload);
    console.log('[xAuthToken]', challengerGuid);

    expect(response.status()).toBe(201);
  });
});
