import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("Should be able to do a statement operation for a user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Test",
      email: "test@test.com",
      password: "admin",
    });

    const statement = await statementsRepositoryInMemory.create({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("Should not be able to do a statement operation for a non-existent user", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "Test",
        email: "test@test.com",
        password: "admin",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to do a statement operation without statements ", async () => {
    expect(async () => {
      const statement = await statementsRepositoryInMemory.create({
        user_id: "userId",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Test",
      });

      await getStatementOperationUseCase.execute({
        user_id: "userId",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
