/* eslint-disable prettier/prettier */
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You dont have enough balance');
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!categoryExists) {
      console.log('categoria nova');
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);

      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category: newCategory,
      });
      await transactionRepository.save(transaction);
      return transaction;
    }
    console.log('categoria já existe');
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryExists,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
