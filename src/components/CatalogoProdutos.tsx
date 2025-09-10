"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Package, 
  Wrench,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Usuario, ProdutoPiso, Acessorio } from '@/lib/types';
import { 
  obterProdutosPiso, 
  obterAcessorios, 
  criarProdutoPiso, 
  atualizarProdutoPiso,
  criarAcessorio,
  atualizarAcessorio,
  obterStatusEstoque,
  importarPisosCSV
} from '@/lib/utils-estoque';
import BadgeEstoque from '@/components/BadgeEstoque';

interface CatalogoProdutosProps {
  usuario: Usuario;
}

export default function CatalogoProdutos({ usuario }: CatalogoProdutosProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('pisos');
  const [busca, setBusca] = useState('');
  const [filtroAcabamento, setFiltroAcabamento] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');
  const [modalPisoAberto, setModalPisoAberto] = useState(false);
  const [modalAcessorioAberto, setModalAcessorioAberto] = useState(false);
  const [pisoEditando, setPisoEditando] = useState<ProdutoPiso | null>(null);
  const [acessorioEditando, setAcessorioEditando] = useState<Acessorio | null>(null);
  const [carregandoImportacao, setCarregandoImportacao] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados dos formulários
  const [formPiso, setFormPiso] = useState({
    sku: '',
    nome: '',
    dimensao_cm_ladoA: '',
    dimensao_cm_ladoB: '',
    pecas_por_caixa: '',
    acabamento: 'fosco' as 'fosco' | 'polido',
    colecao_cor: '',
    preco_m2: '',
    estoque_caixas: '',
    estoque_min_caixas: '',
    ativo: true
  });

  const [formAcessorio, setFormAcessorio] = useState({
    sku: '',
    nome: '',
    tipo: 'argamassa' as 'argamassa' | 'rejunte' | 'cunha' | 'espaçador' | 'rodapé',
    preco_unit: '',
    estoque_unidades: '',
    estoque_min_unidades: '',
    ativo: true
  });

  // Obter dados
  const produtosPiso = obterProdutosPiso();
  const acessorios = obterAcessorios();

  // Filtrar produtos
  const pisosFiltrados = produtosPiso.filter(produto => {
    const matchBusca = !busca || 
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      produto.sku.toLowerCase().includes(busca.toLowerCase()) ||
      produto.colecao_cor.toLowerCase().includes(busca.toLowerCase());
    
    const matchAcabamento = !filtroAcabamento || produto.acabamento === filtroAcabamento;
    const matchAtivo = filtroAtivo === '' || produto.ativo.toString() === filtroAtivo;
    
    return matchBusca && matchAcabamento && matchAtivo;
  });

  const acessoriosFiltrados = acessorios.filter(acessorio => {
    const matchBusca = !busca || 
      acessorio.nome.toLowerCase().includes(busca.toLowerCase()) ||
      acessorio.sku.toLowerCase().includes(busca.toLowerCase());
    
    const matchAtivo = filtroAtivo === '' || acessorio.ativo.toString() === filtroAtivo;
    
    return matchBusca && matchAtivo;
  });

  // Handlers do formulário de piso
  const handleSalvarPiso = () => {
    try {
      const dados = {
        sku: formPiso.sku,
        nome: formPiso.nome,
        dimensao_cm_ladoA: parseFloat(formPiso.dimensao_cm_ladoA),
        dimensao_cm_ladoB: parseFloat(formPiso.dimensao_cm_ladoB),
        pecas_por_caixa: parseInt(formPiso.pecas_por_caixa),
        acabamento: formPiso.acabamento,
        colecao_cor: formPiso.colecao_cor,
        preco_m2: parseFloat(formPiso.preco_m2),
        estoque_caixas: parseInt(formPiso.estoque_caixas),
        estoque_min_caixas: parseInt(formPiso.estoque_min_caixas),
        ativo: formPiso.ativo
      };

      if (pisoEditando) {
        atualizarProdutoPiso(pisoEditando.id, dados);
      } else {
        criarProdutoPiso(dados);
      }

      setModalPisoAberto(false);
      resetFormPiso();
    } catch (error) {
      console.error('Erro ao salvar piso:', error);
    }
  };

  const handleEditarPiso = (piso: ProdutoPiso) => {
    setPisoEditando(piso);
    setFormPiso({
      sku: piso.sku,
      nome: piso.nome,
      dimensao_cm_ladoA: piso.dimensao_cm_ladoA.toString(),
      dimensao_cm_ladoB: piso.dimensao_cm_ladoB.toString(),
      pecas_por_caixa: piso.pecas_por_caixa.toString(),
      acabamento: piso.acabamento,
      colecao_cor: piso.colecao_cor,
      preco_m2: piso.preco_m2.toString(),
      estoque_caixas: piso.estoque_caixas.toString(),
      estoque_min_caixas: piso.estoque_min_caixas.toString(),
      ativo: piso.ativo
    });
    setModalPisoAberto(true);
  };

  const resetFormPiso = () => {
    setPisoEditando(null);
    setFormPiso({
      sku: '',
      nome: '',
      dimensao_cm_ladoA: '',
      dimensao_cm_ladoB: '',
      pecas_por_caixa: '',
      acabamento: 'fosco',
      colecao_cor: '',
      preco_m2: '',
      estoque_caixas: '',
      estoque_min_caixas: '',
      ativo: true
    });
  };

  // Handlers do formulário de acessório
  const handleSalvarAcessorio = () => {
    try {
      const dados = {
        sku: formAcessorio.sku,
        nome: formAcessorio.nome,
        tipo: formAcessorio.tipo,
        preco_unit: parseFloat(formAcessorio.preco_unit),
        estoque_unidades: parseInt(formAcessorio.estoque_unidades),
        estoque_min_unidades: parseInt(formAcessorio.estoque_min_unidades),
        ativo: formAcessorio.ativo
      };

      if (acessorioEditando) {
        atualizarAcessorio(acessorioEditando.id, dados);
      } else {
        criarAcessorio(dados);
      }

      setModalAcessorioAberto(false);
      resetFormAcessorio();
    } catch (error) {
      console.error('Erro ao salvar acessório:', error);
    }
  };

  const resetFormAcessorio = () => {
    setAcessorioEditando(null);
    setFormAcessorio({
      sku: '',
      nome: '',
      tipo: 'argamassa',
      preco_unit: '',
      estoque_unidades: '',
      estoque_min_unidades: '',
      ativo: true
    });
  };

  // Importação CSV
  const handleImportarCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCarregandoImportacao(true);
    setResultadoImportacao(null);

    try {
      const text = await file.text();
      const resultado = importarPisosCSV(text);
      setResultadoImportacao(resultado);
    } catch (error) {
      setResultadoImportacao({
        sucesso: false,
        produtos_importados: 0,
        produtos_atualizados: 0,
        erros: ['Erro ao processar arquivo CSV']
      });
    } finally {
      setCarregandoImportacao(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const cabecalho = 'sku,nome,dimensao_cm_ladoA,dimensao_cm_ladoB,pecas_por_caixa,preco_m2,acabamento,colecao_cor,estoque_caixas,estoque_min_caixas,ativo';
    const linhas = produtosPiso.map(p => 
      `${p.sku},"${p.nome}",${p.dimensao_cm_ladoA},${p.dimensao_cm_ladoB},${p.pecas_por_caixa},${p.preco_m2},${p.acabamento},"${p.colecao_cor}",${p.estoque_caixas},${p.estoque_min_caixas},${p.ativo}`
    );
    
    const csv = [cabecalho, ...linhas].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pisos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            Catálogo de Produtos
          </h2>
          <p className="text-blue-600 dark:text-blue-300">
            Gerencie pisos e acessórios do catálogo
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, SKU ou coleção..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroAcabamento} onValueChange={setFiltroAcabamento}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Acabamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="fosco">Fosco</SelectItem>
                <SelectItem value="polido">Polido</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Importação */}
      {resultadoImportacao && (
        <Alert className={resultadoImportacao.sucesso ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {resultadoImportacao.sucesso ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription className={resultadoImportacao.sucesso ? "text-green-700" : "text-red-700"}>
            {resultadoImportacao.sucesso ? (
              <>
                <strong>Importação concluída!</strong><br />
                {resultadoImportacao.produtos_importados} produtos importados, {resultadoImportacao.produtos_atualizados} atualizados.
              </>
            ) : (
              <>
                <strong>Erro na importação:</strong><br />
                {resultadoImportacao.erros.join(', ')}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="pisos" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Pisos ({pisosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="acessorios" className="flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Acessórios ({acessoriosFiltrados.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {abaSelecionada === 'pisos' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportarCSV}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={carregandoImportacao}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {carregandoImportacao ? 'Importando...' : 'Importar CSV'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportarCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </>
            )}
            
            <Dialog 
              open={abaSelecionada === 'pisos' ? modalPisoAberto : modalAcessorioAberto} 
              onOpenChange={abaSelecionada === 'pisos' ? setModalPisoAberto : setModalAcessorioAberto}
            >
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (abaSelecionada === 'pisos') {
                      resetFormPiso();
                    } else {
                      resetFormAcessorio();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {abaSelecionada === 'pisos' ? 'Novo Piso' : 'Novo Acessório'}
                </Button>
              </DialogTrigger>
              
              {/* Modal Piso */}
              {abaSelecionada === 'pisos' && (
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {pisoEditando ? 'Editar Piso' : 'Novo Piso'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formPiso.sku}
                        onChange={(e) => setFormPiso({...formPiso, sku: e.target.value})}
                        placeholder="Ex: CALA62x120-P"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formPiso.nome}
                        onChange={(e) => setFormPiso({...formPiso, nome: e.target.value})}
                        placeholder="Ex: Calacata Bianco 62×120"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ladoA">Lado A (cm) *</Label>
                      <Input
                        id="ladoA"
                        type="number"
                        value={formPiso.dimensao_cm_ladoA}
                        onChange={(e) => setFormPiso({...formPiso, dimensao_cm_ladoA: e.target.value})}
                        placeholder="62"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ladoB">Lado B (cm) *</Label>
                      <Input
                        id="ladoB"
                        type="number"
                        value={formPiso.dimensao_cm_ladoB}
                        onChange={(e) => setFormPiso({...formPiso, dimensao_cm_ladoB: e.target.value})}
                        placeholder="120"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pecas">Peças por Caixa *</Label>
                      <Input
                        id="pecas"
                        type="number"
                        value={formPiso.pecas_por_caixa}
                        onChange={(e) => setFormPiso({...formPiso, pecas_por_caixa: e.target.value})}
                        placeholder="2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="acabamento">Acabamento *</Label>
                      <Select 
                        value={formPiso.acabamento} 
                        onValueChange={(value: 'fosco' | 'polido') => setFormPiso({...formPiso, acabamento: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fosco">Fosco</SelectItem>
                          <SelectItem value="polido">Polido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="colecao">Coleção/Cor *</Label>
                      <Input
                        id="colecao"
                        value={formPiso.colecao_cor}
                        onChange={(e) => setFormPiso({...formPiso, colecao_cor: e.target.value})}
                        placeholder="Calacata"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="preco">Preço por m² *</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formPiso.preco_m2}
                        onChange={(e) => setFormPiso({...formPiso, preco_m2: e.target.value})}
                        placeholder="129.90"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estoque">Estoque (caixas) *</Label>
                      <Input
                        id="estoque"
                        type="number"
                        value={formPiso.estoque_caixas}
                        onChange={(e) => setFormPiso({...formPiso, estoque_caixas: e.target.value})}
                        placeholder="80"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estoqueMin">Estoque Mínimo *</Label>
                      <Input
                        id="estoqueMin"
                        type="number"
                        value={formPiso.estoque_min_caixas}
                        onChange={(e) => setFormPiso({...formPiso, estoque_min_caixas: e.target.value})}
                        placeholder="20"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={formPiso.ativo}
                        onCheckedChange={(checked) => setFormPiso({...formPiso, ativo: checked})}
                      />
                      <Label htmlFor="ativo">Produto Ativo</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setModalPisoAberto(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSalvarPiso}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {pisoEditando ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </DialogContent>
              )}
              
              {/* Modal Acessório */}
              {abaSelecionada === 'acessorios' && (
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {acessorioEditando ? 'Editar Acessório' : 'Novo Acessório'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formAcessorio.sku}
                        onChange={(e) => setFormAcessorio({...formAcessorio, sku: e.target.value})}
                        placeholder="Ex: ARG-FLEX-20KG"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formAcessorio.nome}
                        onChange={(e) => setFormAcessorio({...formAcessorio, nome: e.target.value})}
                        placeholder="Ex: Argamassa Flexível 20kg"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select 
                        value={formAcessorio.tipo} 
                        onValueChange={(value: any) => setFormAcessorio({...formAcessorio, tipo: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="argamassa">Argamassa</SelectItem>
                          <SelectItem value="rejunte">Rejunte</SelectItem>
                          <SelectItem value="cunha">Cunha</SelectItem>
                          <SelectItem value="espaçador">Espaçador</SelectItem>
                          <SelectItem value="rodapé">Rodapé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="precoUnit">Preço Unitário *</Label>
                      <Input
                        id="precoUnit"
                        type="number"
                        step="0.01"
                        value={formAcessorio.preco_unit}
                        onChange={(e) => setFormAcessorio({...formAcessorio, preco_unit: e.target.value})}
                        placeholder="28.90"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estoqueUnidades">Estoque (unidades) *</Label>
                      <Input
                        id="estoqueUnidades"
                        type="number"
                        value={formAcessorio.estoque_unidades}
                        onChange={(e) => setFormAcessorio({...formAcessorio, estoque_unidades: e.target.value})}
                        placeholder="200"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estoqueMinUnidades">Estoque Mínimo *</Label>
                      <Input
                        id="estoqueMinUnidades"
                        type="number"
                        value={formAcessorio.estoque_min_unidades}
                        onChange={(e) => setFormAcessorio({...formAcessorio, estoque_min_unidades: e.target.value})}
                        placeholder="50"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={formAcessorio.ativo}
                        onCheckedChange={(checked) => setFormAcessorio({...formAcessorio, ativo: checked})}
                      />
                      <Label htmlFor="ativo">Produto Ativo</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setModalAcessorioAberto(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSalvarAcessorio}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {acessorioEditando ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <TabsContent value="pisos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pisosFiltrados.map((piso) => (
              <Card key={piso.id} className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        {piso.nome}
                      </CardTitle>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        SKU: {piso.sku}
                      </p>
                    </div>
                    <BadgeEstoque produto={piso} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600 dark:text-blue-300">Dimensões:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {piso.dimensao_cm_ladoA}×{piso.dimensao_cm_ladoB}cm
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 dark:text-blue-300">Peças/Caixa:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {piso.pecas_por_caixa}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 dark:text-blue-300">m²/Caixa:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {piso.m2_por_caixa.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 dark:text-blue-300">Acabamento:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100 capitalize">
                        {piso.acabamento}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-800">
                    <div>
                      <span className="text-sm text-blue-600 dark:text-blue-300">Preço:</span>
                      <p className="font-bold text-blue-900 dark:text-blue-100">
                        R$ {piso.preco_m2.toFixed(2)}/m²
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarPiso(piso)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    Estoque: {piso.estoque_caixas} caixas (mín: {piso.estoque_min_caixas})
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {pisosFiltrados.length === 0 && (
            <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Nenhum piso encontrado
                </h3>
                <p className="text-blue-600 dark:text-blue-300">
                  Ajuste os filtros ou adicione novos produtos ao catálogo.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="acessorios">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acessoriosFiltrados.map((acessorio) => (
              <Card key={acessorio.id} className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        {acessorio.nome}
                      </CardTitle>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        SKU: {acessorio.sku}
                      </p>
                    </div>
                    <BadgeEstoque produto={acessorio} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {acessorio.tipo}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-800">
                    <div>
                      <span className="text-sm text-blue-600 dark:text-blue-300">Preço:</span>
                      <p className="font-bold text-blue-900 dark:text-blue-100">
                        R$ {acessorio.preco_unit.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAcessorioEditando(acessorio);
                          setFormAcessorio({
                            sku: acessorio.sku,
                            nome: acessorio.nome,
                            tipo: acessorio.tipo,
                            preco_unit: acessorio.preco_unit.toString(),
                            estoque_unidades: acessorio.estoque_unidades.toString(),
                            estoque_min_unidades: acessorio.estoque_min_unidades.toString(),
                            ativo: acessorio.ativo
                          });
                          setModalAcessorioAberto(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    Estoque: {acessorio.estoque_unidades} unidades (mín: {acessorio.estoque_min_unidades})
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {acessoriosFiltrados.length === 0 && (
            <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
              <CardContent className="p-8 text-center">
                <Wrench className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Nenhum acessório encontrado
                </h3>
                <p className="text-blue-600 dark:text-blue-300">
                  Ajuste os filtros ou adicione novos produtos ao catálogo.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}