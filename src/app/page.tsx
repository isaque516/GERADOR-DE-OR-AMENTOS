"use client";

import { useState, useEffect } from 'react';
import { obterSessao, limparSessao, isPrimeiroLogin } from '@/lib/auth';
import { Usuario } from '@/lib/types';
import LoginPage from '@/components/LoginPage';
import TrocarSenhaPage from '@/components/TrocarSenhaPage';
import SistemaCatalogoEstoque from '@/components/SistemaCatalogoEstoque';

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [precisaTrocarSenha, setPrecisaTrocarSenha] = useState(false);

  // Verificar sessão existente ao carregar
  useEffect(() => {
    const sessao = obterSessao();
    if (sessao) {
      setUsuario(sessao.usuario);
    }
    setCarregandoSessao(false);
  }, []);

  // Callback para login bem-sucedido
  const handleLoginSuccess = (usuarioLogado: Usuario) => {
    setUsuario(usuarioLogado);
    
    // Verificar se é primeiro login (senha padrão)
    const senhasPadrao = {
      'admin@porcelarte.com': 'Admin@123',
      'marcia@porcelarte.com': 'Marcia@123',
      'isaque@porcelarte.com': 'Isaque@123',
      'gabriely@porcelarte.com': 'Gabriely@123',
      'mirele@porcelarte.com': 'Mirele@123'
    };
    
    // Em um cenário real, isso seria verificado no backend
    // Por simplicidade, assumimos que é primeiro login se a senha ainda é a padrão
    setPrecisaTrocarSenha(false); // Desabilitado para demonstração
  };

  // Callback para logout
  const handleLogout = () => {
    limparSessao();
    setUsuario(null);
    setPrecisaTrocarSenha(false);
  };

  // Callback para senha alterada
  const handleSenhaAlterada = () => {
    setPrecisaTrocarSenha(false);
  };

  // Mostrar loading enquanto verifica sessão
  if (carregandoSessao) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-300">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostrar tela de login
  if (!usuario) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Se precisa trocar senha, mostrar tela de troca
  if (precisaTrocarSenha) {
    return (
      <TrocarSenhaPage 
        email={usuario.email} 
        onSenhaAlterada={handleSenhaAlterada} 
      />
    );
  }

  // Usuário logado - mostrar sistema principal
  return (
    <SistemaCatalogoEstoque 
      usuario={usuario} 
      onLogout={handleLogout} 
    />
  );
}