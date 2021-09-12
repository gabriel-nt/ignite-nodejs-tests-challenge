import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to show a user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Test",
      email: "test@test.com",
      password: "admin",
    });

    const profile = await showUserProfileUseCase.execute(String(user.id));

    expect(profile).toHaveProperty("id");
    expect(profile.name).toHaveProperty(user.name);
  });

  it("Should not be able to show profile a non-existent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("user");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
