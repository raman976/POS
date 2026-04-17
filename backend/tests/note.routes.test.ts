import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/InMemoryUserRepository';
import { InMemoryNoteRepository } from '../src/infrastructure/repositories/InMemoryNoteRepository';
import { InMemoryFileRepository } from '../src/infrastructure/repositories/InMemoryFileRepository';

describe('Note routes', () => {
  it('creates and lists notes for authenticated user', async () => {
    const app = createApp({
      userRepository: new InMemoryUserRepository(),
      noteRepository: new InMemoryNoteRepository(),
      fileRepository: new InMemoryFileRepository(),
    });

    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Raman',
      email: 'notes@test.com',
      password: 'secret123',
    });

    const cookie = registerResponse.headers['set-cookie'];

    const createResponse = await request(app)
      .post('/api/notes')
      .set('Cookie', cookie)
      .send({
        title: 'First Note',
        body: 'Remember to build tasks module next',
      });

    const listResponse = await request(app).get('/api/notes').set('Cookie', cookie);

    expect(createResponse.status).toBe(201);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.notes).toHaveLength(1);
    expect(listResponse.body.notes[0].title).toBe('First Note');
  });

  it('blocks note creation for guest user', async () => {
    const app = createApp({
      userRepository: new InMemoryUserRepository(),
      noteRepository: new InMemoryNoteRepository(),
      fileRepository: new InMemoryFileRepository(),
    });

    const response = await request(app).post('/api/notes').send({
      title: 'No Auth',
      body: 'This should fail',
    });

    expect(response.status).toBe(401);
  });
});
