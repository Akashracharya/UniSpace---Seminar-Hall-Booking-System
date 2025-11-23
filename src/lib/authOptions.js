import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google'; // <--- Import Google
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    // 1. Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // 2. Existing Email/Password Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error('No user found');
        if (!user.password) throw new Error('Please login with Google'); // Safety check
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Incorrect password');
        return { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
      },
    }),
  ],
  callbacks: {
    // This runs EVERY time someone logs in (Google or Email)
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await dbConnect();
        try {
          // Check if user exists in DB
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // If not, CREATE them automatically!
            await User.create({
              name: user.name,
              email: user.email,
              // No password needed
            });
          }
          return true; // Allow login
        } catch (error) {
          console.log("Error saving user", error);
          return false; // Deny login if DB fails
        }
      }
      return true; // Allow normal email login
    },
    async jwt({ token, user }) {
      // If user is logging in, try to fetch their Role (Admin/Student) from DB
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id;
          token.isAdmin = dbUser.isAdmin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};