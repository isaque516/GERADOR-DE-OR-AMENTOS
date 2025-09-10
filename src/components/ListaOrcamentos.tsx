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
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Send, 
  CheckCircle, 
  X,
  Calculator,
  ShoppingCart,
  FileText,
  MessageCircle,
  AlertTriangle,
  Package,
  User,
  MapPin
} from 'lucide-react';
import { Usuario, ProdutoPiso, Acessorio, Cliente, Orcamento, OrcamentoItem, AcessorioSelecionado } from '@/lib/types';
import { 
  obterProdutosPiso, 
  obterAcessorios, 
  validarEstoqueSuficiente 
} from '@/lib/utils-estoque';
import { 
  calcularCaixasNecessarias, 
  calcularSubtotalItem, 
  sugerirAcessorios,
  gerarMensagemWhatsApp,
  validarAprovacaoOrcamento,
  formatarMoeda,
  formatarArea
} from '@/lib/utils-orcamento';
import BadgeEstoque from '@/components/BadgeEstoque';

interface ListaOrcamentosProps {
  usuario: Usuario;
}

// Dados simulados de clientes e orçamentos
const clientesSimulados: Cliente[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    telefone: '(11) 99999-1234',
    cidade: 'São Paulo',
    cep: '01234-567'
  },
  {
    id: '2',
    nome: 'João Santos',
    telefone: '(11) 88888-5678',
    cidade: 'Guarulhos',
    cep: '07123-456'
  }
];

export default function ListaOrcamentos({ usuario }: ListaOrcamentosProps) {
  const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [orcamentoEditando, setOrcamentoEditando] = useState<Orcamento | null>(null);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Estados do formulário de cliente
  const [formCliente, setFormCliente] = useState({
    nome: '',
    telefone: '',
    cidade: '',
    cep: ''
  });

  // Estados do formulário de orçamento
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [itensOrcamento, setItensOrcamento] = useState<Array<{
    produto: ProdutoPiso;
    area_cliente_m2: number;
    fator_perda_percent: number;
  }>>([]);
  const [acessoriosSelecionados, setAcessoriosSelecionados] = useState<AcessorioSelecionado[]>([]);
  const [frete, setFrete] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [prazoEstimado, setPrazoEstimado] = useState(7);
  const [observacoes, setObservacoes] = useState('');

  // Obter dados
  const produtosPiso = obterProdutosPiso().filter(p => p.ativo);
  const acessorios = obterAcessorios().filter(a => a.ativo);

  // Orçamentos simulados
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([
    {
      id: '1',
      dataHora: new Date('2024-01-15T10:30:00'),
      vendedor_id: usuario.id,
      vendedor: usuario,
      cliente_id: '1',
      cliente: clientesSimulados[0],
      itens: [],
      area_total_m2: 45.5,
      valor_produtos: 5915.45,
      valor_acessorios: 287.60,
      frete: 150.00,
      desconto: 0,
      valor_final: 6353.05,
      prazo_estimado_dias: 7,
      status: 'enviado',
      observacoes: 'Cliente prefere entrega pela manhã'
    }
  ]);

  // Calcular totais do orçamento atual
  const calcularTotais = () => {
    const areaTotalM2 = itensOrcamento.reduce((total, item) => {
      const { area_com_perda } = calcularCaixasNecessarias(item.produto, item.area_cliente_m2, item.fator_perda_percent);
      return total + area_com_perda;
    }, 0);

    const valorProdutos = itensOrcamento.reduce((total, item) => {
      return total + calcularSubtotalItem(item.produto, item.area_cliente_m2, item.fator_perda_percent);
    }, 0);

    const valorAcessorios = acessoriosSelecionados.reduce((total, item) => {
      return total + item.subtotal;
    }, 0);

    const valorFinal = valorProdutos + valorAcessorios + frete - desconto;

    return {
      area_total_m2: areaTotalM2,
      valor_produtos: valorProdutos,
      valor_acessorios: valorAcessorios,
      valor_final: valorFinal
    };
  };

  const totais = calcularTotais();

  // Adicionar produto ao orçamento
  const adicionarProduto = (produtoId: string, area: number, perda: number = 10) => {
    const produto = produtosPiso.find(p => p.id === produtoId);
    if (!produto) return;

    setItensOrcamento([...itensOrcamento, {
      produto,
      area_cliente_m2: area,
      fator_perda_percent: perda
    }]);
  };

  // Remover produto do orçamento
  const removerProduto = (index: number) => {
    setItensOrcamento(itensOrcamento.filter((_, i) => i !== index));
  };

  // Sugerir acessórios automaticamente
  const aplicarSugestaoAcessorios = () => {
    const sugestoes = sugerirAcessorios(acessorios, totais.area_total_m2);
    const novosAcessorios = sugestoes.map(sugestao => ({
      acessorio: sugestao.acessorio,
      quantidade: sugestao.quantidade_sugerida,
      subtotal: sugestao.quantidade_sugerida * sugestao.acessorio.preco_unit
    }));
    setAcessoriosSelecionados(novosAcessorios);
  };

  // Salvar cliente
  const salvarCliente = () => {
    if (!formCliente.nome || !formCliente.telefone || !formCliente.cidade) {
      setErro('Nome, telefone e cidade são obrigatórios');
      return;
    }

    const novoCliente: Cliente = {
      id: Date.now().toString(),
      ...formCliente
    };

    clientesSimulados.push(novoCliente);
    setClienteSelecionado(novoCliente);
    setModalClienteAberto(false);
    resetFormCliente();
  };

  const resetFormCliente = () => {
    setFormCliente({
      nome: '',
      telefone: '',
      cidade: '',
      cep: ''
    });
    setErro('');
  };

  // Enviar orçamento por WhatsApp
  const enviarWhatsApp = () => {
    if (!clienteSelecionado || itensOrcamento.length === 0) {
      setErro('Selecione um cliente e adicione pelo menos um produto');
      return;
    }

    // Preparar dados para a mensagem
    const itensFormatados = itensOrcamento.map(item => {
      const { caixas_necessarias } = calcularCaixasNecessarias(item.produto, item.area_cliente_m2, item.fator_perda_percent);
      return {
        produto: item.produto,
        area_cliente_m2: item.area_cliente_m2,
        fator_perda_percent: item.fator_perda_percent,
        caixas_necessarias,
        subtotal: calcularSubtotalItem(item.produto, item.area_cliente_m2, item.fator_perda_percent)
      };
    });

    const mensagem = gerarMensagemWhatsApp(
      clienteSelecionado,
      itensFormatados,
      acessoriosSelecionados,
      {
        ...totais,
        frete,
        desconto
      },
      prazoEstimado,
      observacoes
    );

    // Abrir WhatsApp
    const telefone = clienteSelecionado.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    // Salvar orçamento como enviado
    const novoOrcamento: Orcamento = {
      id: Date.now().toString(),
      dataHora: new Date(),
      vendedor_id: usuario.id,
      vendedor: usuario,
      cliente_id: clienteSelecionado.id,
      cliente: clienteSelecionado,
      itens: [], // Simplificado para demo
      area_total_m2: totais.area_total_m2,
      valor_produtos: totais.valor_produtos,
      valor_acessorios: totais.valor_acessorios,
      frete,
      desconto,
      valor_final: totais.valor_final,
      prazo_estimado_dias: prazoEstimado,
      status: 'enviado',
      observacoes
    };

    setOrcamentos([novoOrcamento, ...orcamentos]);
    setSucesso('Orçamento enviado por WhatsApp com sucesso!');
    resetFormOrcamento();
    setModalOrcamentoAberto(false);

    setTimeout(() => setSucesso(''), 3000);
  };

  const resetFormOrcamento = () => {
    setClienteSelecionado(null);
    setItensOrcamento([]);
    setAcessoriosSelecionados([]);
    setFrete(0);
    setDesconto(0);
    setPrazoEstimado(7);
    setObservacoes('');
    setErro('');
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'enviado':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'aprovado':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            Orçamentos
          </h2>
          <p className="text-blue-600 dark:text-blue-300">
            Crie e gerencie orçamentos de pisos
          </p>
        </div>
        
        <Dialog open={modalOrcamentoAberto} onOpenChange={setModalOrcamentoAberto}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={resetFormOrcamento}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Seleção de Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Select 
                      value={clienteSelecionado?.id || ''} 
                      onValueChange={(value) => {
                        const cliente = clientesSimulados.find(c => c.id === value);
                        setClienteSelecionado(cliente || null);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientesSimulados.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={modalClienteAberto} onOpenChange={setModalClienteAberto}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={resetFormCliente}>
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Cliente
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Cliente</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="nomeCliente">Nome *</Label>
                            <Input
                              id="nomeCliente"
                              value={formCliente.nome}
                              onChange={(e) => setFormCliente({...formCliente, nome: e.target.value})}
                              placeholder="Nome completo"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="telefoneCliente">Telefone *</Label>
                            <Input
                              id="telefoneCliente"
                              value={formCliente.telefone}
                              onChange={(e) => setFormCliente({...formCliente, telefone: e.target.value})}
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cidadeCliente">Cidade *</Label>
                            <Input
                              id="cidadeCliente"
                              value={formCliente.cidade}
                              onChange={(e) => setFormCliente({...formCliente, cidade: e.target.value})}
                              placeholder="Cidade"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cepCliente">CEP</Label>
                            <Input
                              id="cepCliente"
                              value={formCliente.cep}
                              onChange={(e) => setFormCliente({...formCliente, cep: e.target.value})}
                              placeholder="00000-000"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-6">
                          <Button variant="outline" onClick={() => setModalClienteAberto(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={salvarCliente} className="bg-blue-600 hover:bg-blue-700">
                            Salvar Cliente
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {clienteSelecionado && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-800 rounded-lg">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-blue-600" />
                          {clienteSelecionado.nome}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1 text-blue-600" />
                          {clienteSelecionado.telefone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                          {clienteSelecionado.cidade}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Produtos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Produtos ({itensOrcamento.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Adicionar produto de exemplo
                        if (produtosPiso.length > 0) {
                          adicionarProduto(produtosPiso[0].id, 25, 10);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {itensOrcamento.length === 0 ? (
                    <div className="text-center py-8 text-blue-600 dark:text-blue-300">
                      Nenhum produto adicionado
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itensOrcamento.map((item, index) => {
                        const { area_com_perda, caixas_necessarias } = calcularCaixasNecessarias(
                          item.produto, 
                          item.area_cliente_m2, 
                          item.fator_perda_percent
                        );
                        const subtotal = calcularSubtotalItem(item.produto, item.area_cliente_m2, item.fator_perda_percent);
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-800 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                  {item.produto.nome}
                                </h4>
                                <BadgeEstoque produto={item.produto} quantidadeSolicitada={caixas_necessarias} />
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-300">
                                Área: {formatarArea(item.area_cliente_m2)} (+{item.fator_perda_percent}% = {formatarArea(area_com_perda)}) • 
                                Caixas: {caixas_necessarias} • 
                                Subtotal: {formatarMoeda(subtotal)}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removerProduto(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Acessórios */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Acessórios ({acessoriosSelecionados.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={aplicarSugestaoAcessorios}
                      disabled={totais.area_total_m2 === 0}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Sugerir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {acessoriosSelecionados.length === 0 ? (
                    <div className="text-center py-4 text-blue-600 dark:text-blue-300">
                      Nenhum acessório selecionado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {acessoriosSelecionados.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-800 rounded">
                          <div>
                            <span className="font-medium text-blue-900 dark:text-blue-100">
                              {item.acessorio.nome}
                            </span>
                            <span className="text-sm text-blue-600 dark:text-blue-300 ml-2">
                              {item.quantidade}x {formatarMoeda(item.acessorio.preco_unit)} = {formatarMoeda(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumo e Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="frete">Frete</Label>
                      <Input
                        id="frete"
                        type="number"
                        step="0.01"
                        value={frete}
                        onChange={(e) => setFrete(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="desconto">Desconto</Label>
                      <Input
                        id="desconto"
                        type="number"
                        step="0.01"
                        value={desconto}
                        onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="prazo">Prazo (dias úteis)</Label>
                      <Input
                        id="prazo"
                        type="number"
                        value={prazoEstimado}
                        onChange={(e) => setPrazoEstimado(parseInt(e.target.value) || 7)}
                        placeholder="7"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Área total:</span>
                        <span>{formatarArea(totais.area_total_m2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Produtos:</span>
                        <span>{formatarMoeda(totais.valor_produtos)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acessórios:</span>
                        <span>{formatarMoeda(totais.valor_acessorios)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete:</span>
                        <span>{formatarMoeda(frete)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desconto:</span>
                        <span>-{formatarMoeda(desconto)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatarMoeda(totais.valor_final)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais para o cliente..."
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
              <Button variant="outline" onClick={() => setModalOrcamentoAberto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={enviarWhatsApp}
                className="bg-green-600 hover:bg-green-700"
                disabled={!clienteSelecionado || itensOrcamento.length === 0}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar WhatsApp
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
                  placeholder="Buscar por cliente ou observações..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 gap-4">
        {orcamentos.map((orcamento) => (
          <Card key={orcamento.id} className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                    {orcamento.cliente.nome}
                  </CardTitle>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {formatarData(orcamento.dataHora)} • {orcamento.vendedor.nome}
                  </p>
                </div>
                <Badge className={obterCorStatus(orcamento.status)}>
                  {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-300">Área Total:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {formatarArea(orcamento.area_total_m2)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-300">Valor:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {formatarMoeda(orcamento.valor_final)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-300">Prazo:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {orcamento.prazo_estimado_dias} dias
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-300">Cidade:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {orcamento.cliente.cidade}
                  </p>
                </div>
              </div>
              
              {orcamento.observacoes && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-800 rounded text-sm">
                  <strong>Observações:</strong> {orcamento.observacoes}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {orcamento.status === 'enviado' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orcamentos.length === 0 && (
        <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-blue-600 dark:text-blue-300">
              Crie seu primeiro orçamento para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}