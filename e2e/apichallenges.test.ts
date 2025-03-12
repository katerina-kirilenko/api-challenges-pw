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
  xmlTitle,
  notAdminBase64,
  adminBase64,
  firstNote,
} from '../src/types';
import { v4 as uuidv4 } from 'uuid';

/** The API Challenges */

test.describe('First Real Challenge', { tag: '@GET/challenges' }, () => {
  test('02 Issue a GET request on the `/challenges` end point', async ({ request }) => {
    const response = await request.get(URLs.CHALLENGES);
    const { challenges } = await response.json();

    expect(response.status()).toBe(200);
    expect(challenges.length).toBe(59);
  });
});

test.describe('GET Challenges', { tag: '@GET/todo(s)' }, () => {
  test('03 Issue a GET request on the `/todos` end point', async ({ request }) => {
    const response = await request.get(URLs.TODOS);
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(todos.length).toBe(10);
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
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(todos[0].id).toBe(todoId);
  });

  test('06 Issue a GET request on the `/todos/{id}` end point for a todo that does not exist', async ({ request }) => {
    const todoId = 12;
    const response = await request.get(`${URLs.TODOS}/${todoId}`);
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(404);
    expect(errorMessages[0]).toBe(ErrorMessage.todoNotFound(todoId));
  });

  test('07 Issue a GET request on the `/todos` end point with a query filter to get only todos which are `done`', async ({
    request,
  }) => {
    await request.post(URLs.TODOS, { data: TODO });

    const response = await request.get(`${URLs.TODOS}?doneStatus=true`);
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(todos.every((todo: { doneStatus: boolean }) => todo.doneStatus)).toBeTruthy();
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(400);
    expect(errorMessages[0]).toBe('Failed Validation: doneStatus should be BOOLEAN but was STRING');
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(400);
    expect(errorMessages[0]).toBe(ErrorMessage.tooLongTitle);
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(400);
    expect(errorMessages[0]).toBe(ErrorMessage.tooLongDescription);
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(413);
    expect(errorMessages[0]).toBe(ErrorMessage.extraLong);
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(400);
    expect(errorMessages[0]).toBe(ErrorMessage.wrongField('priority'));
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(404);
    expect(errorMessages[0]).toBe(ErrorMessage.wrongTodoId(todoId));
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(400);
    expect(errorMessages[0]).toBe(ErrorMessage.mandatoryField);
  });

  test('22 Issue a PUT request to fail to update an existing todo because id different in payload.', async ({
    request,
  }) => {
    const response = await request.put(`${URLs.TODOS}/${todoId}`, { data: { id: 99, ...TODO } });
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(400);
    expect(errorMessages[0]).toBe(ErrorMessage.amendId);
  });
});

test.describe('DELETE Challenges', { tag: '@DELETE/todos/{id}' }, () => {
  const todoId = 1;

  test('23 Issue a DELETE request to successfully delete a todo', async ({ request }) => {
    const response = await request.delete(`${URLs.TODOS}/${todoId}`);
    const getTodo = await request.get(`${URLs.TODOS}/${todoId}`);
    const { errorMessages } = await getTodo.json();

    expect(response.status()).toBe(200);
    expect(errorMessages[0]).toBe(ErrorMessage.todoNotFound(todoId));
  });
});

test.describe('OPTIONS Challenges', { tag: '@OPTIONS/todos' }, () => {
  test("24 Issue an OPTIONS request on the `/todos` end point. You might want to manually check the 'Allow' header in the response is as expected.", async ({
    page,
  }) => {
    const response = await page.request.fetch(URLs.TODOS, { method: 'OPTIONS' });
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
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(todos.length).toBeGreaterThan(1);
  });

  test('27 Issue a GET request on the `/todos` end point with an `Accept` header of `*/*` to receive results in default JSON format', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.any,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.get(URLs.TODOS);
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(todos.length).toBeGreaterThan(1);
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
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(contentTypes.json);
    expect(todos.length).toBeGreaterThan(1);
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
    expect(responseXml.includes(xmlTitle)).toBeTruthy();
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
    const { errorMessages } = await response.json();

    expect(response.status()).toBe(415);
    expect(errorMessages[0]).toBe(ErrorMessage.unsupportedContentType(contentType));
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

  test('37 Issue a GET request on the `/challenger/database/{guid}` end point, to retrieve the current todos database for the user. You can use this to restore state later.', async ({
    request,
  }) => {
    const response = await request.get(`${URLs.DATABASE}/${process.env.GUID}`);
    const { todos } = await response.json();

    expect(response.status()).toBe(200);
    expect(todos.length).toBeGreaterThanOrEqual(10);
  });

  test('38 Issue a PUT request on the `/challenger/database/{guid}` end point, with a payload to restore the Todos database in memory.', async ({
    request,
  }) => {
    const data = await request.get(URLs.TODOS);
    const payload = { data: await data.json() };

    const response = await request.put(`${URLs.DATABASE}/${process.env.GUID}`, payload);

    expect(response.status()).toBe(204);
  });
});

test.describe('Mix Accept and Content-Type Challenges', { tag: '@Accept+Content-Type' }, () => {
  test('39 Issue a POST request on the `/todos` end point to create a todo using Content-Type `application/xml` but Accept `application/json`', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.json,
        'Content-Type': contentTypes.xml,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.post(URLs.TODOS, { data: xmlBody });
    const todo = await response.json();

    expect(response.status()).toBe(201);
    expect(todo.title).toBe(xmlTitle);
  });

  test('40 Issue a POST request on the `/todos` end point to create a todo using Content-Type `application/json` but Accept `application/xml`', async ({}) => {
    const requestContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: contentTypes.xml,
        'Content-Type': contentTypes.json,
        'x-challenger': process.env.GUID || '',
      },
    });

    const response = await requestContext.post(URLs.TODOS, { data: TODO });
    const responseXml = await response.text();

    expect(response.status()).toBe(201);
    expect(responseXml.includes('<todo>')).toBeTruthy();
  });
});

test.describe('Status Code Challenges', { tag: '@Status-Code' }, () => {
  test('41 Issue a DELETE request on the `/heartbeat` end point and receive 405 (Method Not Allowed)', async ({
    request,
  }) => {
    const response = await request.delete(URLs.HEARTBEAT);

    expect(response.status()).toBe(405);
    expect(response.statusText()).toBe(ErrorMessage.notAllowed);
  });

  test('42 Issue a PATCH request on the `/heartbeat` end point and receive 500 (internal server error)', async ({
    request,
  }) => {
    const response = await request.patch(URLs.HEARTBEAT);

    expect(response.status()).toBe(500);
    expect(response.statusText()).toBe(ErrorMessage.serverError);
  });

  test('43 Issue a TRACE request on the `/heartbeat` end point and receive 501 (Not Implemented)', async ({ page }) => {
    const response = await page.request.fetch(URLs.HEARTBEAT, { method: 'TRACE' });

    expect(response.status()).toBe(501);
    expect(response.statusText()).toBe(ErrorMessage.notImplemented);
  });

  test('44 Issue a GET request on the `/heartbeat` end point and receive 204 when server is running', async ({
    request,
  }) => {
    const response = await request.get(URLs.HEARTBEAT);

    expect(response.status()).toBe(204);
    expect(response.statusText()).toBe(ErrorMessage.noContent);
  });
});

test.describe('HTTP Method Override Challenges', { tag: '@HTTP-Method-Override' }, () => {
  test('45 Issue a POST request on the `/heartbeat` end point and receive 405 when you override the Method Verb to a DELETE', async ({
    request,
  }) => {
    const response = await request.post(URLs.HEARTBEAT, {
      headers: { 'X-HTTP-Method-Override': 'DELETE' },
    });

    expect(response.status()).toBe(405);
    expect(response.statusText()).toBe(ErrorMessage.notAllowed);
  });

  test('46 Issue a POST request on the `/heartbeat` end point and receive 500 when you override the Method Verb to a PATCH', async ({
    request,
  }) => {
    const response = await request.post(URLs.HEARTBEAT, {
      headers: { 'X-HTTP-Method-Override': 'PATCH' },
    });

    expect(response.status()).toBe(500);
    expect(response.statusText()).toBe(ErrorMessage.serverError);
  });

  test('47 Issue a POST request on the `/heartbeat` end point and receive 501 (Not Implemented) when you override the Method Verb to a TRACE', async ({
    request,
  }) => {
    const response = await request.post(URLs.HEARTBEAT, {
      headers: { 'X-HTTP-Method-Override': 'TRACE' },
    });

    expect(response.status()).toBe(501);
    expect(response.statusText()).toBe(ErrorMessage.notImplemented);
  });
});

test.describe('Authentication Challenges', { tag: '@Authentication' }, () => {
  test('48 Issue a POST request on the `/secret/token` end point and receive 401 when Basic auth username/password is not admin/password', async ({
    request,
  }) => {
    const response = await request.post(URLs.AUTHENTICATION, {
      headers: { Authorization: `Basic ${notAdminBase64}` },
    });

    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe(ErrorMessage.unauthorized);
  });

  test('49 Issue a POST request on the `/secret/token` end point and receive 201 when Basic auth username/password is admin/password', async ({
    request,
  }) => {
    const response = await request.post(URLs.AUTHENTICATION, {
      headers: { Authorization: `Basic ${adminBase64}` },
    });
    const headers = response.headers();

    expect(response.status()).toBe(201);
    expect(headers).toHaveProperty('x-auth-token');
  });
});

test.describe('Authorization Challenges', { tag: '@Authorization' }, () => {
  test('50 Issue a GET request on the `/secret/note` end point and receive 403 when X-AUTH-TOKEN does not match a valid token', async ({
    request,
  }) => {
    const response = await request.get(URLs.AUTHORIZATION, {
      headers: { 'x-auth-token': '1111' },
    });

    expect(response.status()).toBe(403);
    expect(response.statusText()).toBe(ErrorMessage.forbidden);
  });

  test('51 Issue a GET request on the `/secret/note` end point and receive 401 when no X-AUTH-TOKEN header present', async ({
    request,
  }) => {
    const response = await request.get(URLs.AUTHORIZATION);
    const headers = response.headers();

    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe(ErrorMessage.unauthorized);
    expect(headers).not.toHaveProperty('x-auth-token');
  });

  test('52 Issue a GET request on the `/secret/note` end point receive 200 when valid X-AUTH-TOKEN used - response body should contain the note', async ({
    request,
  }) => {
    // Authentication
    const auth = await request.post(URLs.AUTHENTICATION, {
      headers: { Authorization: `Basic ${adminBase64}` },
    });
    const headers = auth.headers();
    const xAuthToken = headers['x-auth-token'];

    expect(auth.status()).toBe(201);

    // Authorization
    const response = await request.get(URLs.AUTHORIZATION, {
      headers: { 'x-auth-token': xAuthToken },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('note');
  });

  test('53 Issue a POST request on the `/secret/note` end point with a note payload e.g. {"note":"my note"} and receive 200 when valid X-AUTH-TOKEN used.', async ({
    request,
  }) => {
    // Authentication
    const auth = await request.post(URLs.AUTHENTICATION, {
      headers: { Authorization: `Basic ${adminBase64}` },
    });
    const headers = auth.headers();
    const xAuthToken = headers['x-auth-token'];

    expect(auth.status()).toBe(201);

    // Authorization
    const response = await request.post(URLs.AUTHORIZATION, {
      headers: { 'x-auth-token': xAuthToken },
      data: firstNote,
    });
    const { note } = await response.json();

    expect(response.status()).toBe(200);
    expect(note).toBe(firstNote.note);
  });

  test('54 Issue a POST request on the `/secret/note` end point with a note payload {"note":"my note"} and receive 401 when no X-AUTH-TOKEN present', async ({
    request,
  }) => {
    const response = await request.post(URLs.AUTHORIZATION, {
      data: firstNote,
    });

    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe(ErrorMessage.unauthorized);
  });

  test('55 Issue a POST request on the `/secret/note` end point with a note payload {"note":"my note"} and receive 403 when X-AUTH-TOKEN does not match a valid token', async ({
    request,
  }) => {
    const response = await request.post(URLs.AUTHORIZATION, {
      headers: { 'x-auth-token': '1111' },
      data: firstNote,
    });

    expect(response.status()).toBe(403);
    expect(response.statusText()).toBe(ErrorMessage.forbidden);
  });

  test('56 Issue a GET request on the `/secret/note` end point receive 200 when using the X-AUTH-TOKEN value as an Authorization Bearer token - response body should contain the note', async ({
    request,
  }) => {
    // Authentication
    const auth = await request.post(URLs.AUTHENTICATION, {
      headers: { Authorization: `Basic ${adminBase64}` },
    });
    const headers = auth.headers();
    const token = headers['x-auth-token'];

    expect(auth.status()).toBe(201);

    // Authorization
    const response = await request.get(URLs.AUTHORIZATION, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('note');
  });

  test('57 Issue a POST request on the `/secret/note` end point with a note payload e.g. {"note":"my note"} and receive 200 when valid X-AUTH-TOKEN value used as an Authorization Bearer token.', async ({
    request,
  }) => {
    // Authentication
    const auth = await request.post(URLs.AUTHENTICATION, {
      headers: { Authorization: `Basic ${adminBase64}` },
    });
    const headers = auth.headers();
    const token = headers['x-auth-token'];

    expect(auth.status()).toBe(201);

    // Authorization
    const response = await request.post(URLs.AUTHORIZATION, {
      headers: { Authorization: `Bearer ${token}` },
      data: firstNote,
    });
    const { note } = await response.json();

    expect(response.status()).toBe(200);
    expect(note).toBe(firstNote.note);
  });
});

test.describe('Miscellaneous Challenges', { tag: '@Miscellaneous' }, () => {
  test('58 Issue a DELETE request to successfully delete the last todo in system so that there are no more todos in the system', async ({
    request,
  }) => {
    const response = await request.get(URLs.TODOS);
    const { todos } = await response.json();

    // Delete all todos in cycle
    for (const todo of todos) {
      const deleteResponse = await request.delete(`${URLs.TODOS}/${todo.id}`);

      expect(deleteResponse.status()).toBe(200);
    }

    // Check todos length
    const res = await request.get(URLs.TODOS);
    const body = await res.json();

    expect(body.todos.length).toBe(0);
  });

  test('59 Issue as many POST requests as it takes to add the maximum number of TODOS allowed for a user.', async ({
    request,
  }) => {
    const maxTodos = 20;

    const response = await request.get(URLs.TODOS);
    const { todos } = await response.json();
    let todosToCreate = maxTodos - todos.length;

    // Create maximum number of TODOS
    while (todosToCreate > 0) {
      const createResponse = await request.post(URLs.TODOS, { data: TODO });
      todosToCreate--;

      expect(createResponse.status()).toBe(201);
    }

    // Create one more TODO
    const createOverResponse = await request.post(URLs.TODOS, { data: TODO });

    expect(createOverResponse.status()).toBe(400);
    expect(createOverResponse.statusText()).toBe(ErrorMessage.badRequest);
  });
});
