import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // todo
        await dbConnect();

        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please provide both email/username and password");
        }

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier }, // todo
              { username: credentials.identifier },
            ],
          });
          // console.log("email ", credentials.identifier);
          // console.log(" username", credentials.identifier);
          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            // todo
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            // ya return ja kahan rha ha aur return karta waqt sab kuch specify kyun kar rha aur sirf user kyun nhi return kar rha
            return {
              _id: String(user._id), // Changed from 'id' to '_id'
              id: String(user._id), // Keep 'id' for NextAuth compatibility
              email: user.email,
              username: user.username,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages,
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err) {
          // todo
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error("An error occurred during authentication");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // where did this user come from (30:00 )
      if (user) {
        token._id = user._id; // Now this will work
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token; // token ka payload data ziada hoo jaye ga lakin hama database query nhi karni paray gi har session request pr
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session; // next auth session base strategy pa chalta ha and what does that mean
    },
  },
 
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};
