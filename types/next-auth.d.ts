import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    userId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
  }
}