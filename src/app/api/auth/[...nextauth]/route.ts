import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    return null
                }

                // Check password (supports both legacy plain text and new hashed passwords for transition safety, or just hash)
                // For now, let's assume all new users use hash. 
                // If the stored password matches plain text (legacy dev), allow it.
                let isValid = false;
                if (user.password === credentials.password) {
                    isValid = true;
                } else {
                    isValid = await bcrypt.compare(credentials.password, user.password);
                }

                if (isValid) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions // Pass permissions
                    }
                }
                return null
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.permissions = (user as any).permissions;
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).permissions = token.permissions;
            }
            return session
        }
    },
    pages: {
        signIn: '/login', // Custom login page
    },
    session: {
        strategy: "jwt"
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
