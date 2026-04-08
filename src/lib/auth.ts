import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // DEMO BYPASS: Auto-create and allow demo123
        if (credentials.password === "demo123") {
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                role: (credentials.email as string).includes("organizer") ? "ORGANISER" : "ATTENDEE",
                name: (credentials.email as string).split("@")[0],
                // @ts-ignore
                password: "demo",
              },
            });
          }
          return user;
        }

        const u = user as any;
        if (!u || !u.password) {
          throw new Error("User not found");
        }

        const bcrypt = require("bcryptjs");
        const isValid = await bcrypt.compare(credentials.password, u.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
});
