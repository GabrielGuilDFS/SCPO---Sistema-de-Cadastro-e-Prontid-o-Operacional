import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role/profile. */
      perfil?: string;
      matricula?: string;
    } & DefaultSession["user"]
  }

  interface User {
    perfil?: string;
    matricula?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    perfil?: string;
    matricula?: string;
  }
}
