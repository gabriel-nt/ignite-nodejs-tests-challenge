import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test@test.com",
      password: "admin",
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create user exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Test",
        email: "test@test.com",
        password: "admin",
      });

      await createUserUseCase.execute({
        name: "Test",
        email: "test@test.com",
        password: "admin",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
