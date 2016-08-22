import knex from 'knex';
import bookshelf from 'bookshelf';
import database from '../database';

export default bookshelf(knex(database.development));