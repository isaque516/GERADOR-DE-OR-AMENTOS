// Utilitários para autenticação e gestão de sessão

import { Usuario, SessaoUsuario } from './types';

// Simulação de banco de dados de usuários (em produção seria Supabase)
export const usuariosIniciais: Usuario[] = [
  {
    id: '1',
    nome: 'Francisco',
    email: 'admin@porcelarte.com',
    perfil: 'admin',
    ativo: true,
    criado_em: new Date('2024-01-01'),
    ultimo_login_em: new Date()
  },
  {
    id: '2',
    nome: 'Marcia',
    email: 'marcia@porcelarte.com',
    perfil: 'vendedor',
    ativo: true,
    criado_em: new Date('2024-01-01')
  },
  {
    id: '3',
    nome: 'Isaque',
    email: 'isaque@porcelarte.com',
    perfil: 'vendedor',
    ativo: true,
    criado_em: new Date('2024-01-01')
  },
  {
    id: '4',
    nome: 'Gabriely',
    email: 'gabriely@porcelarte.com',
    perfil: 'vendedor',
    ativo: true,
    criado_em: new Date('2024-01-01')
  },
  {
    id: '5',
    nome: 'Mirele',
    email: 'mirele@porcelarte.com',
    perfil: 'vendedor',
    ativo: true,
    criado_em: new Date('2024-01-01')
  }
];

// Senhas padrão (em produção seria hash bcrypt)
const senhasPadrao: Record<string, string> = {
  'admin@porcelarte.com': 'Admin@123',
  'marcia@porcelarte.com': 'Marcia@123',
  'isaque@porcelarte.com': 'Isaque@123',
  'gabriely@porcelarte.com': 'Gabriely@123',
  'mirele@porcelarte.com': 'Mirele@123'
};

// Controle de tentativas de login (rate limiting)
const tentativasLogin = new Map<string, { count: number; ultimaTentativa: Date }>();

// Simular autenticação
export async function autenticarUsuario(email: string, senha: string): Promise<{ sucesso: boolean; usuario?: Usuario; erro?: string }> {
  // Verificar rate limiting
  const agora = new Date();
  const tentativas = tentativasLogin.get(email);
  
  if (tentativas && tentativas.count >= 5) {
    const tempoEspera = 15 * 60 * 1000; // 15 minutos
    const tempoRestante = tentativas.ultimaTentativa.getTime() + tempoEspera - agora.getTime();
    
    if (tempoRestante > 0) {
      const minutosRestantes = Math.ceil(tempoRestante / (60 * 1000));
      return {
        sucesso: false,
        erro: `Muitas tentativas. Tente novamente em ${minutosRestantes} minutos.`
      };
    } else {
      // Reset após 15 minutos
      tentativasLogin.delete(email);
    }
  }

  // Buscar usuário
  const usuario = usuariosIniciais.find(u => u.email === email && u.ativo);
  
  if (!usuario) {
    // Incrementar tentativas
    const atual = tentativasLogin.get(email) || { count: 0, ultimaTentativa: agora };
    tentativasLogin.set(email, { count: atual.count + 1, ultimaTentativa: agora });
    
    return {
      sucesso: false,
      erro: 'Email ou senha incorretos'
    };
  }

  // Verificar senha (em produção seria bcrypt.compare)
  const senhaCorreta = senhasPadrao[email];
  if (senha !== senhaCorreta) {
    // Incrementar tentativas
    const atual = tentativasLogin.get(email) || { count: 0, ultimaTentativa: agora };
    tentativasLogin.set(email, { count: atual.count + 1, ultimaTentativa: agora });
    
    return {
      sucesso: false,
      erro: 'Email ou senha incorretos'
    };
  }

  // Login bem-sucedido - limpar tentativas
  tentativasLogin.delete(email);
  
  // Atualizar último login
  usuario.ultimo_login_em = agora;

  return {
    sucesso: true,
    usuario
  };
}

// Gerar token JWT simulado
export function gerarToken(usuario: Usuario): string {
  // Em produção seria JWT real
  return btoa(JSON.stringify({
    userId: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  }));
}

// Validar token
export function validarToken(token: string): { valido: boolean; usuario?: Usuario } {
  try {
    const payload = JSON.parse(atob(token));
    
    // Verificar expiração
    if (payload.exp < Date.now()) {
      return { valido: false };
    }
    
    // Buscar usuário
    const usuario = usuariosIniciais.find(u => u.id === payload.userId && u.ativo);
    
    if (!usuario) {
      return { valido: false };
    }
    
    return { valido: true, usuario };
  } catch {
    return { valido: false };
  }
}

// Gerenciar sessão no localStorage
export function salvarSessao(usuario: Usuario, token: string): void {
  const sessao: SessaoUsuario = {
    usuario,
    token,
    expira_em: new Date(Date.now() + (24 * 60 * 60 * 1000))
  };
  
  localStorage.setItem('porcelarte_sessao', JSON.stringify(sessao));
}

export function obterSessao(): SessaoUsuario | null {
  try {
    const sessaoStr = localStorage.getItem('porcelarte_sessao');
    if (!sessaoStr) return null;
    
    const sessao: SessaoUsuario = JSON.parse(sessaoStr);
    
    // Verificar expiração
    if (new Date(sessao.expira_em) < new Date()) {
      limparSessao();
      return null;
    }
    
    // Validar token
    const { valido, usuario } = validarToken(sessao.token);
    if (!valido || !usuario) {
      limparSessao();
      return null;
    }
    
    // Atualizar dados do usuário na sessão
    sessao.usuario = usuario;
    
    return sessao;
  } catch {
    limparSessao();
    return null;
  }
}

export function limparSessao(): void {
  localStorage.removeItem('porcelarte_sessao');
}

// Verificar se usuário tem permissão
export function temPermissao(usuario: Usuario, acao: 'ver_catalogo' | 'editar_catalogo' | 'ver_estoque' | 'editar_estoque'): boolean {
  if (!usuario.ativo) return false;
  
  switch (acao) {
    case 'ver_catalogo':
    case 'ver_estoque':
      return true; // Todos podem ver
    case 'editar_catalogo':
    case 'editar_estoque':
      return usuario.perfil === 'admin';
    default:
      return false;
  }
}

// Verificar se é primeiro login (senha padrão)
export function isPrimeiroLogin(email: string, senha: string): boolean {
  return senhasPadrao[email] === senha;
}

// Alterar senha (simulado)
export function alterarSenha(email: string, senhaAtual: string, novaSenha: string): { sucesso: boolean; erro?: string } {
  if (senhasPadrao[email] !== senhaAtual) {
    return { sucesso: false, erro: 'Senha atual incorreta' };
  }
  
  if (novaSenha.length < 6) {
    return { sucesso: false, erro: 'Nova senha deve ter pelo menos 6 caracteres' };
  }
  
  // Atualizar senha (em produção seria hash bcrypt)
  senhasPadrao[email] = novaSenha;
  
  return { sucesso: true };
}