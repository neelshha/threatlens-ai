import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      // Attach the Google user ID to token
      if (account) {
        token.id = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user.id is available
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};