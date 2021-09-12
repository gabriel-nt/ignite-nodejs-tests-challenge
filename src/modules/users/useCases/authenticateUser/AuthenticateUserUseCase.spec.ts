import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Authenticate user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to authenticate a user", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "123456",
      name: "User",
    });

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate a non user exist", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with invalid password", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        email: "user@test.com",
        password: "123456",
        name: "User",
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "12345",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
