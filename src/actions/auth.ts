"use server"; // Esto le dice a Next.js que este código NUNCA se enviará al navegador (es súper seguro)

import { prisma } from '../lib/prisma';
import { cookies } from 'next/headers';

export async function loginUser(email: string, password_hash: string) {
  try {
    // 1. Buscamos al usuario por su correo
    const user = await prisma.usuario.findUnique({
      where: { email: email },
      include: { rol: true }
    });

    // 2. Si no existe, regresamos un error
    if (!user) {
      return { success: false, error: "El correo no existe en la base de datos institucional." };
    }

    // 3. Verificamos la contraseña (Ojo: en producción usaremos bcrypt para encriptar)
    if (user.passwordHash !== password_hash) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    // 4. ¡Todo bien! Guardamos la cookie de sesión y regresamos el rol
    const cookieStore = await cookies();
    cookieStore.set('userRole', user.rol.nombre, { httpOnly: false, path: '/' });
    cookieStore.set('userId', String(user.id), { httpOnly: false, path: '/' });

    return { success: true, role: user.rol.nombre, userId: user.id };
    
  } catch (error) {
    console.error("Error en BD:", error);
    return { success: false, error: "Error de conexión con el servidor." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('userRole');
  cookieStore.delete('userId');
}

export async function loginWithGoogle(email: string) {
  try {
    // En una implementación real, aquí verificaríamos el token de Google
    // Por ahora, simulamos el éxito si el correo existe en nuestra BD institucional
    const user = await prisma.usuario.findUnique({
      where: { email: email },
      include: { rol: true }
    });

    if (!user) {
      return { 
        success: false, 
        error: "Este correo de Google no está vinculado a ninguna cuenta institucional." 
      };
    }

    const cookieStore = await cookies();
    cookieStore.set('userRole', user.rol.nombre, { httpOnly: false, path: '/' });
    cookieStore.set('userId', String(user.id), { httpOnly: false, path: '/' });

    return { success: true, role: user.rol.nombre, userId: user.id };
  } catch (error) {
    console.error("Error en Google Auth Simulation:", error);
    return { success: false, error: "Error en la conexión con Google." };
  }
}