import request from 'supertest';
import { hash } from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;

const userId = uuidV4();
const senderId = uuidV4();

describe('Create Transfer Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
    VALUES ('${userId}', 'user', 'user@finapi.com.br', '${password}', 'now()', 'now()')`,
    );

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
    VALUES ('${senderId}', 'sender', 'sender@finapi.com.br', '${password}', 'now()', 'now()')`,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a transfer', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'user@finapi.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    await request(app)
      .post('/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit Supertest',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post(`/statements/transfers/${senderId}`)
      .send({
        amount: 50,
        description: 'Transfer Supertest',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('transfer');
    expect(response.body).toHaveProperty('id');
  });
});
