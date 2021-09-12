import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

let getBalanceUseCase: GetBalanceUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("Should be able to get balance for a user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Test",
      email: "test@test.com",
      password: "admin",
    });

    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("statement");
  });

  it("Should not be able to get balance for a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "userId",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
