"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Package,
  Wrench,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Usuario, MovimentacaoEstoque } from '@/lib/types';
import { 
  obterProdutosPiso, 
  obterAcessorios, 
  criarMovimentacaoEstoque,
  obterMovimentacoes
} from '@/lib/utils-estoque';

interface MovimentacoesEstoqueProps {
  usuario: Usuario;
}

export default function MovimentacoesEstoque({ usuario }: MovimentacoesEstoqueProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroProdutoTipo, setFiltroProdutoTipo] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Form state
  const [form, setForm] = useState({
    produto_tipo: 'piso' as 'piso' | 'acessorio',
    produto_id: '',
    tipo: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantidade: '',
    motivo: ''
  });

  // Obter dados
  const produtosPiso = obterProdutosPiso();
  const acessorios = obterAcessorios();
  const movimentacoes = obterMovimentacoes();

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const produto = mov.produto_tipo === 'piso' 
      ? produtosPiso.find(p => p.id === mov.produto_id)
      : acessorios.find(a => a.id === mov.produto_id);
    
    const matchBusca = !busca || 
      produto?.nome.toLowerCase().includes(busca.toLowerCase()) ||
      produto?.sku.toLowerCase().includes(busca.toLowerCase()) ||
      mov.motivo.toLowerCase().includes(busca.toLowerCase());
    
    const matchTipo = !filtroTipo || mov.tipo === filtroTipo;
    const matchProdutoTipo = !filtroProdutoTipo || mov.produto_tipo === filtroProdutoTipo;
    
    return matchBusca && matchTipo && matchProdutoTipo;
  });

  // Obter produtos disponíveis baseado no tipo selecionado
  const produtosDisponiveis = form.produto_tipo === 'piso' ? produtosPiso : acessorios;

  const handleSubmit = () => {
    if (!form.produto_id || !form.quantidade || !form.motivo) {
      setErro('Todos os campos são obrigatórios');
      return;
    }

    const quantidade = parseInt(form.quantidade);
    if (quantidade <= 0) {
      setErro('Quantidade deve ser maior que zero');
      return;
    }

    try {
      const movimentacao = criarMovimentacaoEstoque(
        form.produto_tipo,
        form.produto_id,
        form.tipo,
        quantidade,
        form.motivo,
        usuario
      );

      if (movimentacao) {
        setSucesso('Movimentação registrada com sucesso!');
        setErro('');
        resetForm();
        setModalAberto(false);
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSucesso(''), 3000);
      } else {
        setErro('Erro ao registrar movimentação');
      }
    } catch (error) {
      setErro('Erro interno do sistema');
    }
  };

  const resetForm = () => {
    setForm({
      produto_tipo: 'piso',
      produto_id: '',
      tipo: 'entrada',
      quantidade: '',
      motivo: ''
    });
    setErro('');
  };

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(data));
  };

  const obterIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'saida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ajuste':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const obterCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'saida':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'ajuste':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            Movimentações de Estoque
          </h2>
          <p className="text-blue-600 dark:text-blue-300">
            Registre entradas, saídas e ajustes de estoque
          </p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="produtoTipo">Tipo de Produto *</Label>
                <Select 
                  value={form.produto_tipo} 
                  onValueChange={(value: 'piso' | 'acessorio') => setForm({...form, produto_tipo: value, produto_id: ''})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piso">Piso</SelectItem>
                    <SelectItem value="acessorio">Acessório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="produto">Produto *</Label>
                <Select 
                  value={form.produto_id} 
                  onValueChange={(value) => setForm({...form, produto_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtosDisponiveis.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} ({produto.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tipoMovimentacao">Tipo de Movimentação *</Label>
                <Select 
                  value={form.tipo} 
                  onValueChange={(value: 'entrada' | 'saida' | 'ajuste') => setForm({...form, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantidade">
                  Quantidade ({form.produto_tipo === 'piso' ? 'caixas' : 'unidades'}) *
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={(e) => setForm({...form, quantidade: e.target.value})}
                  placeholder="Digite a quantidade"
                />
                {form.tipo === 'ajuste' && (
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Para ajuste, digite o valor final desejado no estoque
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="motivo">Motivo *</Label>
                <Textarea
                  id="motivo"
                  value={form.motivo}
                  onChange={(e) => setForm({...form, motivo: e.target.value})}
                  placeholder="Descreva o motivo da movimentação"
                  rows={3}
                />
              </div>
              
              {erro && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">
                    {erro}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Registrar Movimentação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mensagem de Sucesso */}
      {sucesso && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            {sucesso}
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por produto ou motivo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroProdutoTipo} onValueChange={setFiltroProdutoTipo}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="piso">Pisos</SelectItem>
                <SelectItem value="acessorio">Acessórios</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentações */}
      <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Histórico de Movimentações ({movimentacoesFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movimentacoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Nenhuma movimentação encontrada
              </h3>
              <p className="text-blue-600 dark:text-blue-300">
                Registre a primeira movimentação ou ajuste os filtros.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {movimentacoesFiltradas.map((movimentacao) => {
                const produto = movimentacao.produto_tipo === 'piso' 
                  ? produtosPiso.find(p => p.id === movimentacao.produto_id)
                  : acessorios.find(a => a.id === movimentacao.produto_id);
                
                return (
                  <div 
                    key={movimentacao.id}
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-800 rounded-lg border border-blue-100 dark:border-blue-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {obterIconeTipo(movimentacao.tipo)}
                        <Badge className={obterCorTipo(movimentacao.tipo)}>
                          {movimentacao.tipo.charAt(0).toUpperCase() + movimentacao.tipo.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          {produto?.nome || 'Produto não encontrado'}
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          SKU: {produto?.sku} • {movimentacao.motivo}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-blue-900 dark:text-blue-100">
                        {movimentacao.tipo === 'entrada' ? '+' : movimentacao.tipo === 'saida' ? '-' : '='}{movimentacao.quantidade}
                        <span className="text-sm font-normal ml-1">
                          {movimentacao.produto_tipo === 'piso' ? 'caixas' : 'un'}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-300">
                        {formatarData(movimentacao.criado_em)}
                      </div>
                      <div className="text-xs text-blue-500 dark:text-blue-400">
                        por {movimentacao.usuario?.nome}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}