import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    member?: {
      id: string
      instrument: string
      position?: string
      hourlyRate: number
    } | null
    client?: {
      id: string
      company?: string
    } | null
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    member?: {
      id: string
      instrument: string
      position?: string
      hourlyRate: number
    } | null
    client?: {
      id: string
      company?: string
    } | null
  }
}