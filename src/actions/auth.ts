"use server"; // Esto le dice a Next.js que este código NUNCA se enviará al navegador (es súper seguro)

import { prisma } from '../lib/prisma';

export async function loginUser(email: string, password_hash: string) {
  try {
    // 1. Buscamos al usuario por su correo
    const user = await prisma.usuario.findUnique({
      where: { email: email }
    });

    // 2. Si no existe, regresamos un error
    if (!user) {
      return { success: false, error: "El correo no existe en la base de datos institucional." };
    }

    // 3. Verificamos la contraseña (Ojo: en producción usaremos bcrypt para encriptar)
    if (user.password_hash !== password_hash) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    // 4. ¡Todo bien! Regresamos el rol para que el frontend lo deje entrar
    return { success: true, role: user.tipo_usuario };
    
  } catch (error) {
    console.error("Error en BD:", error);
    return { success: false, error: "Error de conexión con el servidor." };
  }
}