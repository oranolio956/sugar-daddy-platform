// Global type declarations for modules without @types
declare module 'bcryptjs' {
  export function hash(data: string, saltRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'speakeasy' {
  export function generateSecret(options: {
    name: string;
    issuer: string;
    length?: number;
  }): {
    base32: string;
    otpauth_url: string;
  };

  namespace totp {
    function verify(options: {
      secret: string;
      encoding: string;
      token: string;
      window?: number;
    }): boolean;
  }

  export { totp };
}