import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Check if database is configured
        if (!process.env.DATABASE_URL) {
          throw new Error('Database not configured. Please contact the administrator.')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              member: true,
              client: true,
            },
          })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            member: user.member ? {
              id: user.member.id,
              instrument: user.member.instrument,
              position: user.member.position || undefined,
              hourlyRate: user.member.hourlyRate,
            } : null,
            client: user.client ? {
              id: user.client.id,
              company: user.client.company || undefined,
            } : null,
          }
        } catch (error: any) {
          // Handle Prisma errors gracefully
          if (error.code === 'P1001' || error.message?.includes('DATABASE_URL')) {
            throw new Error('Database connection error. Please try again later.')
          }
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.member = user.member
        token.client = user.client
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.member = token.member
        session.user.client = token.client
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-development-secret-key-please-change-in-production',
}