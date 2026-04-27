import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUsuariosAdministrativos, getRolesYPermisos } from '@/actions/administracion';
import AdministracionClient from './AdministracionClient';

export default async function AdministracionPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value;

  // Solo directores pueden entrar aquí
  if (role !== 'admin') {
    redirect('/dashboard');
  }

  const usuarios = await getUsuariosAdministrativos();
  const { roles, permisos } = await getRolesYPermisos();

  return (
    <AdministracionClient 
      initialUsuarios={usuarios} 
      initialRoles={roles} 
      allPermisos={permisos} 
    />
  );
}
