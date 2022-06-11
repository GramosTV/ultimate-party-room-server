import { DataSource } from 'typeorm';
import { Message } from '../entities/message.entity';

export const messageProviders = [
  {
    provide: 'Message_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
    inject: ['DATA_SOURCE'],
  },
];
