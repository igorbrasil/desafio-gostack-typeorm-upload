import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_name: string;
}
class CreateTransactionService {
  private category: Category;

  public async execute({
    title,
    type,
    value,
    category_name,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    let verifyCategory = await categoryRepository.findOne({
      where: { title: category_name },
    });

    if (!verifyCategory) {
      const category = categoryRepository.create({
        title: category_name,
      });
      verifyCategory = await categoryRepository.save(category);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome') {
      if (value > balance.total) {
        throw new AppError('Saldo insuficiente!', 400);
      }
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: verifyCategory,
    });
    // TODO

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
