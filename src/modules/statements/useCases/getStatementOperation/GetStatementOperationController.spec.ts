import request from "supertest";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
    VALUES ('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get deposit statement", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const statementResponse = await request(app)
      .post("/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit Supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = statementResponse.body;

    const response = await request(app)
      .get(`/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
    expect(response.body.type).toBe("deposit");
  });

  it("Should be able to get withdraw statement", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit Supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementResponse = await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 70,
        description: "Withdraw Supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = statementResponse.body;

    const response = await request(app)
      .get(`/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
    expect(response.body.type).toBe("withdraw");
  });
});
