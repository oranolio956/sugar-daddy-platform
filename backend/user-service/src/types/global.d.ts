// Global type declarations for missing modules
declare module 'cors';
declare module 'morgan';
declare module 'jsonwebtoken';
declare module 'nodemailer';
declare module 'multer';
declare module 'winston';
declare module 'bcrypt';
declare module 'helmet';
declare module 'dotenv';
declare module 'socket.io';
declare module 'stripe';
declare module 'sequelize';
declare module 'sequelize-typescript';
declare module '@jest/globals';

// Global type extensions
declare namespace Express {
  interface Request {
    user?: any;
    session?: any;
    files?: any;
    file?: any;
  }
  
  interface Response {
    locals?: any;
  }
}

// Configuration type
declare type Config = {
  [key: string]: any;
};

// Global config object
declare const config: Config;