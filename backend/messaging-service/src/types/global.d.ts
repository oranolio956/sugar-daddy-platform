// Global type declarations for missing modules
declare module 'express';
declare module 'cors';
declare module 'helmet';
declare module 'morgan';
declare module 'dotenv';
declare module 'socket.io';
declare module 'sequelize';
declare module 'sequelize-typescript';

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