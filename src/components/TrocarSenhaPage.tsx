"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { alterarSenha } from '@/lib/auth';

interface TrocarSenhaPageProps {
  email: string;
  onSenhaAlterada: () => void;
}

export default function TrocarSenhaPage({ email, onSenhaAlterada }: TrocarSenhaPageProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso(false);

    // Validações
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      setCarregando(false);
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres');
      setCarregando(false);
      return;
    }

    if (novaSenha === senhaAtual) {
      setErro('A nova senha deve ser diferente da atual');
      setCarregando(false);
      return;
    }

    try {
      const resultado = alterarSenha(email, senhaAtual, novaSenha);
      
      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          onSenhaAlterada();
        }, 2000);
      } else {
        setErro(resultado.erro || 'Erro ao alterar senha');
      }
    } catch (error) {
      setErro('Erro interno do sistema');
    } finally {
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              Senha Alterada!
            </h2>
            <p className="text-blue-600 dark:text-blue-300">
              Sua senha foi alterada com sucesso. Redirecionando...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Aviso de Primeiro Login */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-orange-700">
            <strong>Primeiro acesso detectado!</strong><br />
            Por segurança, você deve alterar sua senha padrão antes de continuar.
          </AlertDescription>
        </Alert>

        {/* Formulário de Troca de Senha */}
        <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-blue-900 dark:text-blue-100 flex items-center justify-center">
              <KeyRound className="h-5 w-5 mr-2" />
              Alterar Senha
            </CardTitle>
            <p className="text-sm text-blue-600 dark:text-blue-300 text-center">
              Usuário: {email}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={mostrarSenhaAtual ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Sua senha atual"
                    required
                    disabled={carregando}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                    disabled={carregando}
                  >
                    {mostrarSenhaAtual ? (
                      <EyeOff className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={carregando}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    disabled={carregando}
                  >
                    {mostrarNovaSenha ? (
                      <EyeOff className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={mostrarConfirmar ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Digite novamente a nova senha"
                    required
                    disabled={carregando}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    disabled={carregando}
                  >
                    {mostrarConfirmar ? (
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
                {carregando ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-800 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Requisitos da senha:
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Mínimo de 6 caracteres</li>
                <li>• Deve ser diferente da senha atual</li>
                <li>• Recomendado: use letras, números e símbolos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}