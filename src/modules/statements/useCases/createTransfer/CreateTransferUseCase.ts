import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { Statement } from '../../entities/Statement';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateTransferError } from './CreateTransferError';

interface IRequest {
  user_id: string;
  sender_id: string;
  amount: number;
  description: string;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    amount,
    description,
    sender_id,
    user_id,
  }: IRequest): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferError.SenderNotFound();
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id,
      with_statement: true,
    });

    if (amount > balance.balance) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type: OperationType.TRANSFER,
      amount,
      description,
      sender_id,
    });

    return statementOperation;
  }
}

export { CreateTransferUseCase };
