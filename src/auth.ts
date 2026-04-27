import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          console.error("No se recibió correo de Google");
          return false;
        }

        console.log("Intentando inicio de sesión con Google:", user.email);

        let dbUser = await prisma.usuario.findFirst({
          where: { 
            email: {
              equals: user.email,
              mode: 'insensitive'
            }
          },
          include: { rol: true }
        });

        if (!dbUser) {
          console.warn(`Usuario ${user.email} no encontrado. Intentando auto-creación para dominio @cecyteq.edu.mx`);
          
          if (user.email.endsWith('@cecyteq.edu.mx')) {
            const adminRole = await prisma.rol.findUnique({ where: { nombre: 'admin' } });
            if (adminRole) {
              dbUser = await prisma.usuario.create({
                data: {
                  email: user.email.toLowerCase(),
                  nombreCompleto: user.name || "Usuario Nuevo",
                  passwordHash: "oauth_managed",
                  rolId: adminRole.id
                },
                include: { rol: true }
              });
              console.log("Usuario auto-creado como admin:", user.email);
            }
          }
        }

        if (!dbUser) {
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error en el callback de signIn:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        const dbUser = await prisma.usuario.findFirst({
          where: { 
            email: {
              equals: session.user.email,
              mode: 'insensitive'
            }
          },
          include: { rol: true }
        });
        
        if (dbUser) {
          (session.user as any).role = dbUser.rol.nombre;
          (session.user as any).id = dbUser.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
})
