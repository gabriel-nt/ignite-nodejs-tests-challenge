import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateTransferError } from './CreateTransferError';
import { CreateTransferUseCase } from './CreateTransferUseCase';

let createTransferUseCase: CreateTransferUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe('Create Statement', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createTransferUseCase = new CreateTransferUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory,
    );
  });

  it('Should be able to create a transfer for a user', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'User',
      email: 'user@test.com',
      password: '1234',
    });

    const sender = await usersRepositoryInMemory.create({
      name: 'Sender',
      email: 'sender@test.com',
      password: '1234',
    });

    await statementsRepositoryInMemory.create({
      amount: 300,
      description: 'Deposit',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const statement = await createTransferUseCase.execute({
      amount: 100,
      description: 'Test',
      user_id: user.id as string,
      sender_id: sender.id as string,
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should not be able to create a transfer for a non-existent user', async () => {
    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: 'Test',
        user_id: 'userId',
        sender_id: 'senderId',
      }),
    ).rejects.toEqual(new CreateTransferError.UserNotFound());
  });

  it('Should not be able to create a transfer for a non-existent sender', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'User',
      email: 'user@test.com',
      password: '1234',
    });

    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: 'Test',
        user_id: user.id as string,
        sender_id: 'senderId',
      }),
    ).rejects.toEqual(new CreateTransferError.SenderNotFound());
  });

  it('Should not be able to create a transfer with insufficient funds', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'User',
      email: 'user@test.com',
      password: '1234',
    });

    const sender = await usersRepositoryInMemory.create({
      name: 'Sender',
      email: 'sender@test.com',
      password: '1234',
    });

    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: 'Test',
        user_id: user.id as string,
        sender_id: sender.id as string,
      }),
    ).rejects.toEqual(new CreateTransferError.InsufficientFunds());
  });
});
