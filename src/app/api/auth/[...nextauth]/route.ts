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
                    // Define default permissions for Cashers if they have none
                    const defaultCashierPermissions = ['DASHBOARD', 'POS', 'CUSTOMERS', 'INVENTORY'];
                    const userPermissions = user.permissions && user.permissions.length > 0
                        ? user.permissions
                        : (user.role === 'CASHIER' ? defaultCashierPermissions : []);

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        permissions: userPermissions
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
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Useful for debugging in dev
    // trustHost: true // Uncomment if behind a proxy
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
