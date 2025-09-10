"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, LogIn, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { autenticarUsuario, gerarToken, salvarSessao } from '@/lib/auth';
import { Usuario } from '@/lib/types';

interface LoginPageProps {
  onLoginSuccess: (usuario: Usuario) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const resultado = await autenticarUsuario(email, senha);
      
      if (resultado.sucesso && resultado.usuario) {
        const token = gerarToken(resultado.usuario);
        salvarSessao(resultado.usuario, token);
        onLoginSuccess(resultado.usuario);
      } else {
        setErro(resultado.erro || 'Erro desconhecido');
      }
    } catch (error) {
      setErro('Erro interno do sistema');
    } finally {
      setCarregando(false);
    }
  };

  const preencherCredenciais = (email: string, senha: string) => {
    setEmail(email);
    setSenha(senha);
    setErro('');
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">Porcelarte</h1>
              <p className="text-blue-600 dark:text-blue-300">Sistema de Gestão</p>
            </div>
          </div>
          <p className="text-blue-700 dark:text-blue-200">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário de Login */}
        <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-blue-900 dark:text-blue-100 flex items-center justify-center">
              <LogIn className="h-5 w-5 mr-2" />
              Entrar no Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={carregando}
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    required
                    disabled={carregando}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    disabled={carregando}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>

              {erro && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">
                    {erro}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={carregando}
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Credenciais de Teste */}
        <Card className="bg-blue-100 dark:bg-blue-800 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
              Credenciais de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => preencherCredenciais('admin@porcelarte.com', 'Admin@123')}
                className="justify-start text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <strong>Admin:</strong>&nbsp;admin@porcelarte.com
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => preencherCredenciais('marcia@porcelarte.com', 'Marcia@123')}
                className="justify-start text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <strong>Vendedor:</strong>&nbsp;marcia@porcelarte.com
              </Button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              Clique em uma opção para preencher automaticamente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}