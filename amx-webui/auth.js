// import NextAuth from "next-auth";
// import MongoDBAdapter from "@auth/mongodb-adapter";
// import clientPromise from "@/libs/mongo";


// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [],
//   //adapter: MongoDBAdapter(clientPromise),
// });

import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  
  // pages: {
  //   signIn: "/api/auth/signin",
  // },
});


