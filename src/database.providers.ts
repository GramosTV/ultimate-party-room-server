import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        database: 'ultimate_party_room',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // TRUE ONLY FOR DEVELOPMENT
        // migrations: ['dist/src/db/migrations/*.js'], PRODUCTION
      });

      return dataSource.initialize();
    },
  },
];
