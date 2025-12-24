import { Sequelize } from 'sequelize-typescript';
import { User } from './User';
import { Profile } from './Profile';
import { Match } from './Match';
import { Message } from './Message';
import { VerificationDocument } from './VerificationDocument';
import { PersonalityProfile } from './PersonalityProfile';
import { SuperLike } from './SuperLike';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sugar_daddy_db',
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  models: [User, Profile, Match, Message, VerificationDocument, PersonalityProfile, SuperLike],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export { sequelize, User, Profile, Match, Message, VerificationDocument, PersonalityProfile, SuperLike };

// Initialize database
export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};