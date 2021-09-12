import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("Should be able to create a statement for a user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Test",
      email: "test@test.com",
      password: "admin",
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "Test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(100);
  });

  it("Should not be able to create a statement for a non-existent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "Test",
        type: OperationType.DEPOSIT,
        user_id: "userId",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to withdraw with insufficient funds", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "Test",
        email: "test@test.com",
        password: "admin",
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "Test",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
