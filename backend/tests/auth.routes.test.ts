import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/InMemoryUserRepository';
import { InMemoryNoteRepository } from '../src/infrastructure/repositories/InMemoryNoteRepository';
import { InMemoryFileRepository } from '../src/infrastructure/repositories/InMemoryFileRepository';

describe('Auth routes', () => {
  it('registers user and returns profile', async () => {
    const app = createApp({
      userRepository: new InMemoryUserRepository(),
      noteRepository: new InMemoryNoteRepository(),
      fileRepository: new InMemoryFileRepository(),
    });

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Raman',
        email: 'raman@test.com',
        password: 'secret123',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.email).toBe('raman@test.com');
    expect(registerResponse.headers['set-cookie']).toBeDefined();
  });

  it('supports login and me endpoint with cookie session', async () => {
    const app = createApp({
      userRepository: new InMemoryUserRepository(),
      noteRepository: new InMemoryNoteRepository(),
      fileRepository: new InMemoryFileRepository(),
    });

    await request(app).post('/api/auth/register').send({
      name: 'Raman',
      email: 'raman2@test.com',
      password: 'secret123',
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'raman2@test.com',
      password: 'secret123',
    });

    const cookies = loginResponse.headers['set-cookie'];

    const meResponse = await request(app).get('/api/auth/me').set('Cookie', cookies);

    expect(loginResponse.status).toBe(200);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe('raman2@test.com');
  });
});
