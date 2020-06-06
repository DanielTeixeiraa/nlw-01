import knex from 'knex';
import path from 'path';

const connection = knex({
  client: 'sqlite3',
  connection:{
    filename: path.resolve(__dirname, 'databse.sqlite'),
  },
  migrations:{
    directory: path.resolve(__dirname,'migrations'),
  },
  seeds:{
    directory: path.resolve(__dirname,'seeds'),
  },
  useNullAsDefault: true,
});

export default connection;