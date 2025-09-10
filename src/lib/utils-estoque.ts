// Utilitários para gestão de estoque e produtos

import { ProdutoPiso, Acessorio, MovimentacaoEstoque, StatusEstoque, StatusEstoqueInfo, ProdutoParaRepor, Usuario } from './types';

// ===== DADOS INICIAIS =====

export const produtosPisoIniciais: ProdutoPiso[] = [
  {
    id: '1',
    sku: 'CALA62x120-P',
    nome: 'Calacata Bianco 62×120',
    dimensao_cm_ladoA: 62,
    dimensao_cm_ladoB: 120,
    pecas_por_caixa: 2,
    m2_por_caixa: 1.488, // (62*120*2)/10000
    acabamento: 'polido',
    colecao_cor: 'Calacata',
    preco_m2: 129.90,
    estoque_caixas: 80,
    estoque_min_caixas: 20,
    ativo: true,
    atualizado_em: new Date()
  },
  {
    id: '2',
    sku: 'MAXI83x83-F',
    nome: 'Maxi Negro 83×83',
    dimensao_cm_ladoA: 83,
    dimensao_cm_ladoB: 83,
    pecas_por_caixa: 3,
    m2_por_caixa: 2.067, // (83*83*3)/10000
    acabamento: 'fosco',
    colecao_cor: 'Maxi',
    preco_m2: 89.90,
    estoque_caixas: 120,
    estoque_min_caixas: 30,
    ativo: true,
    atualizado_em: new Date()
  },
  {
    id: '3',
    sku: 'LIVE60x60-F',
    nome: 'Liverpool 60×60',
    dimensao_cm_ladoA: 60,
    dimensao_cm_ladoB: 60,
    pecas_por_caixa: 4,
    m2_por_caixa: 1.44, // (60*60*4)/10000
    acabamento: 'fosco',
    colecao_cor: 'Liverpool',
    preco_m2: 74.90,
    estoque_caixas: 150,
    estoque_min_caixas: 40,
    ativo: true,
    atualizado_em: new Date()
  },
  {
    id: '4',
    sku: 'MARM90x90-P',
    nome: 'Mármore Carrara 90×90',
    dimensao_cm_ladoA: 90,
    dimensao_cm_ladoB: 90,
    pecas_por_caixa: 2,
    m2_por_caixa: 1.62, // (90*90*2)/10000
    acabamento: 'polido',
    colecao_cor: 'Mármore',
    preco_m2: 159.90,
    estoque_caixas: 5, // Estoque baixo para demonstrar alerta
    estoque_min_caixas: 15,
    ativo: true,
    atualizado_em: new Date()
  }
];

export const acessoriosIniciais: Acessorio[] = [
  {
    id: '1',
    sku: 'ARG-FLEX-20KG',
    nome: 'Argamassa Flexível 20kg',
    tipo: 'argamassa',
    preco_unit: 28.90,
    estoque_unidades: 200,
    estoque_min_unidades: 50,
    ativo: true,
    atualizado_em: new Date(),
    rendimento_un_medida: '4-5 m² por saco'
  },
  {
    id: '2',
    sku: 'REJ-CINZA-1KG',
    nome: 'Rejunte Cinza 1kg',
    tipo: 'rejunte',
    preco_unit: 12.50,
    estoque_unidades: 150,
    estoque_min_unidades: 30,
    ativo: true,
    atualizado_em: new Date(),
    rendimento_un_medida: '8-10 m² por kg'
  },
  {
    id: '3',
    sku: 'CUNHA-PLAST-100UN',
    nome: 'Cunha Plástica 100un',
    tipo: 'cunha',
    preco_unit: 15.90,
    estoque_unidades: 80,
    estoque_min_unidades: 20,
    ativo: true,
    atualizado_em: new Date(),
    rendimento_un_medida: '15-20 m² por pacote'
  },
  {
    id: '4',
    sku: 'ESP-2MM-100UN',
    nome: 'Espaçador 2mm 100un',
    tipo: 'espaçador',
    preco_unit: 8.90,
    estoque_unidades: 120,
    estoque_min_unidades: 25,
    ativo: true,
    atualizado_em: new Date(),
    rendimento_un_medida: '10-12 m² por pacote'
  }
];

// Estado global dos produtos (em produção seria Supabase)
let produtosPiso = [...produtosPisoIniciais];
let acessorios = [...acessoriosIniciais];
let movimentacoes: MovimentacaoEstoque[] = [];

// ===== FUNÇÕES DE PRODUTOS =====

export function obterProdutosPiso(): ProdutoPiso[] {
  return [...produtosPiso];
}

export function obterAcessorios(): Acessorio[] {
  return [...acessorios];
}

export function obterProdutoPisoPorId(id: string): ProdutoPiso | undefined {
  return produtosPiso.find(p => p.id === id);
}

export function obterAcessorioPorId(id: string): Acessorio | undefined {
  return acessorios.find(a => a.id === id);
}

// Calcular m² por caixa automaticamente
export function calcularM2PorCaixa(ladoA: number, ladoB: number, pecasPorCaixa: number): number {
  return (ladoA * ladoB * pecasPorCaixa) / 10000;
}

// ===== CRUD PRODUTOS PISO =====

export function criarProdutoPiso(dados: Omit<ProdutoPiso, 'id' | 'm2_por_caixa' | 'atualizado_em'>): ProdutoPiso {
  const novoProduto: ProdutoPiso = {
    ...dados,
    id: Date.now().toString(),
    m2_por_caixa: calcularM2PorCaixa(dados.dimensao_cm_ladoA, dados.dimensao_cm_ladoB, dados.pecas_por_caixa),
    atualizado_em: new Date()
  };
  
  produtosPiso.push(novoProduto);
  return novoProduto;
}

export function atualizarProdutoPiso(id: string, dados: Partial<Omit<ProdutoPiso, 'id' | 'm2_por_caixa' | 'atualizado_em'>>): ProdutoPiso | null {
  const index = produtosPiso.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const produtoAtualizado = {
    ...produtosPiso[index],
    ...dados,
    m2_por_caixa: dados.dimensao_cm_ladoA || dados.dimensao_cm_ladoB || dados.pecas_por_caixa
      ? calcularM2PorCaixa(
          dados.dimensao_cm_ladoA || produtosPiso[index].dimensao_cm_ladoA,
          dados.dimensao_cm_ladoB || produtosPiso[index].dimensao_cm_ladoB,
          dados.pecas_por_caixa || produtosPiso[index].pecas_por_caixa
        )
      : produtosPiso[index].m2_por_caixa,
    atualizado_em: new Date()
  };
  
  produtosPiso[index] = produtoAtualizado;
  return produtoAtualizado;
}

export function excluirProdutoPiso(id: string): boolean {
  const index = produtosPiso.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  produtosPiso.splice(index, 1);
  return true;
}

// ===== CRUD ACESSÓRIOS =====

export function criarAcessorio(dados: Omit<Acessorio, 'id' | 'atualizado_em'>): Acessorio {
  const novoAcessorio: Acessorio = {
    ...dados,
    id: Date.now().toString(),
    atualizado_em: new Date()
  };
  
  acessorios.push(novoAcessorio);
  return novoAcessorio;
}

export function atualizarAcessorio(id: string, dados: Partial<Omit<Acessorio, 'id' | 'atualizado_em'>>): Acessorio | null {
  const index = acessorios.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  const acessorioAtualizado = {
    ...acessorios[index],
    ...dados,
    atualizado_em: new Date()
  };
  
  acessorios[index] = acessorioAtualizado;
  return acessorioAtualizado;
}

export function excluirAcessorio(id: string): boolean {
  const index = acessorios.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  acessorios.splice(index, 1);
  return true;
}

// ===== MOVIMENTAÇÕES DE ESTOQUE =====

export function criarMovimentacaoEstoque(
  produtoTipo: 'piso' | 'acessorio',
  produtoId: string,
  tipo: 'entrada' | 'saida' | 'ajuste',
  quantidade: number,
  motivo: string,
  usuario: Usuario
): MovimentacaoEstoque | null {
  // Verificar se produto existe
  const produto = produtoTipo === 'piso' 
    ? obterProdutoPisoPorId(produtoId)
    : obterAcessorioPorId(produtoId);
    
  if (!produto) return null;
  
  // Criar movimentação
  const movimentacao: MovimentacaoEstoque = {
    id: Date.now().toString(),
    produto_tipo: produtoTipo,
    produto_id: produtoId,
    tipo,
    quantidade,
    motivo,
    usuario_id: usuario.id,
    usuario,
    criado_em: new Date()
  };
  
  // Atualizar estoque do produto
  if (produtoTipo === 'piso') {
    const produtoPiso = produto as ProdutoPiso;
    let novoEstoque = produtoPiso.estoque_caixas;
    
    switch (tipo) {
      case 'entrada':
        novoEstoque += quantidade;
        break;
      case 'saida':
        novoEstoque -= quantidade;
        break;
      case 'ajuste':
        novoEstoque = quantidade; // Ajuste define o valor absoluto
        break;
    }
    
    atualizarProdutoPiso(produtoId, { estoque_caixas: Math.max(0, novoEstoque) });
  } else {
    const acessorio = produto as Acessorio;
    let novoEstoque = acessorio.estoque_unidades;
    
    switch (tipo) {
      case 'entrada':
        novoEstoque += quantidade;
        break;
      case 'saida':
        novoEstoque -= quantidade;
        break;
      case 'ajuste':
        novoEstoque = quantidade; // Ajuste define o valor absoluto
        break;
    }
    
    atualizarAcessorio(produtoId, { estoque_unidades: Math.max(0, novoEstoque) });
  }
  
  // Salvar movimentação
  movimentacoes.push(movimentacao);
  return movimentacao;
}

export function obterMovimentacoes(): MovimentacaoEstoque[] {
  return [...movimentacoes].sort((a, b) => b.criado_em.getTime() - a.criado_em.getTime());
}

// ===== STATUS DE ESTOQUE =====

export function obterStatusEstoque(produto: ProdutoPiso | Acessorio, quantidadeSolicitada?: number): StatusEstoqueInfo {
  if (!produto.ativo) {
    return {
      status: 'cinza',
      mensagem: 'Produto inativo',
      cor_badge: 'bg-gray-100 text-gray-600 border-gray-200'
    };
  }
  
  const estoque = 'estoque_caixas' in produto ? produto.estoque_caixas : produto.estoque_unidades;
  const estoqueMin = 'estoque_min_caixas' in produto ? produto.estoque_min_caixas : produto.estoque_min_unidades;
  const unidade = 'estoque_caixas' in produto ? 'caixas' : 'unidades';
  
  // Se há quantidade solicitada, verificar se é suficiente
  if (quantidadeSolicitada && quantidadeSolicitada > estoque) {
    return {
      status: 'vermelho',
      mensagem: `Estoque insuficiente: precisa de ${quantidadeSolicitada} ${unidade}, disponível ${estoque}`,
      cor_badge: 'bg-red-100 text-red-700 border-red-200'
    };
  }
  
  if (estoque === 0) {
    return {
      status: 'vermelho',
      mensagem: 'Sem estoque',
      cor_badge: 'bg-red-100 text-red-700 border-red-200'
    };
  }
  
  if (estoque <= estoqueMin) {
    return {
      status: 'amarelo',
      mensagem: `Estoque baixo: ${estoque} ${unidade} (mín: ${estoqueMin})`,
      cor_badge: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
  }
  
  return {
    status: 'verde',
    mensagem: `Estoque OK: ${estoque} ${unidade}`,
    cor_badge: 'bg-green-100 text-green-700 border-green-200'
  };
}

// ===== VALIDAÇÕES =====

export function validarEstoqueSuficiente(produtoId: string, produtoTipo: 'piso' | 'acessorio', quantidadeSolicitada: number): boolean {
  const produto = produtoTipo === 'piso' 
    ? obterProdutoPisoPorId(produtoId)
    : obterAcessorioPorId(produtoId);
    
  if (!produto || !produto.ativo) return false;
  
  const estoque = 'estoque_caixas' in produto ? produto.estoque_caixas : produto.estoque_unidades;
  return estoque >= quantidadeSolicitada;
}

// ===== RELATÓRIOS =====

export function obterProdutosParaRepor(): ProdutoParaRepor[] {
  const produtosParaRepor: ProdutoParaRepor[] = [];
  
  // Verificar pisos
  produtosPiso.forEach(produto => {
    if (produto.ativo && produto.estoque_caixas <= produto.estoque_min_caixas) {
      produtosParaRepor.push({
        produto,
        tipo: 'piso',
        estoque_atual: produto.estoque_caixas,
        estoque_min: produto.estoque_min_caixas,
        sugestao_compra: Math.max(produto.estoque_min_caixas * 2 - produto.estoque_caixas, 0)
      });
    }
  });
  
  // Verificar acessórios
  acessorios.forEach(produto => {
    if (produto.ativo && produto.estoque_unidades <= produto.estoque_min_unidades) {
      produtosParaRepor.push({
        produto,
        tipo: 'acessorio',
        estoque_atual: produto.estoque_unidades,
        estoque_min: produto.estoque_min_unidades,
        sugestao_compra: Math.max(produto.estoque_min_unidades * 2 - produto.estoque_unidades, 0)
      });
    }
  });
  
  return produtosParaRepor.sort((a, b) => {
    // Ordenar por criticidade (menor estoque primeiro)
    const criticidadeA = a.estoque_atual / a.estoque_min;
    const criticidadeB = b.estoque_atual / b.estoque_min;
    return criticidadeA - criticidadeB;
  });
}

// ===== IMPORTAÇÃO CSV =====

export function importarPisosCSV(csvContent: string): { sucesso: boolean; produtos_importados: number; produtos_atualizados: number; erros: string[] } {
  const linhas = csvContent.trim().split('\n');
  const cabecalho = linhas[0];
  
  // Verificar cabeçalho esperado
  const cabecalhoEsperado = 'sku,nome,dimensao_cm_ladoA,dimensao_cm_ladoB,pecas_por_caixa,preco_m2,acabamento,colecao_cor,estoque_caixas,estoque_min_caixas,ativo';
  if (cabecalho !== cabecalhoEsperado) {
    return {
      sucesso: false,
      produtos_importados: 0,
      produtos_atualizados: 0,
      erros: ['Cabeçalho CSV inválido. Esperado: ' + cabecalhoEsperado]
    };
  }
  
  let produtosImportados = 0;
  let produtosAtualizados = 0;
  const erros: string[] = [];
  
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i];
    if (!linha.trim()) continue;
    
    try {
      const campos = linha.split(',');
      if (campos.length !== 11) {
        erros.push(`Linha ${i + 1}: Número incorreto de campos`);
        continue;
      }
      
      const [sku, nome, ladoA, ladoB, pecas, preco, acabamento, colecao, estoque, estoqueMin, ativo] = campos;
      
      // Validações
      if (!sku || !nome) {
        erros.push(`Linha ${i + 1}: SKU e nome são obrigatórios`);
        continue;
      }
      
      if (!['fosco', 'polido'].includes(acabamento)) {
        erros.push(`Linha ${i + 1}: Acabamento deve ser 'fosco' ou 'polido'`);
        continue;
      }
      
      const dadosProduto = {
        sku: sku.replace(/"/g, ''),
        nome: nome.replace(/"/g, ''),
        dimensao_cm_ladoA: parseFloat(ladoA),
        dimensao_cm_ladoB: parseFloat(ladoB),
        pecas_por_caixa: parseInt(pecas),
        preco_m2: parseFloat(preco),
        acabamento: acabamento as 'fosco' | 'polido',
        colecao_cor: colecao.replace(/"/g, ''),
        estoque_caixas: parseInt(estoque),
        estoque_min_caixas: parseInt(estoqueMin),
        ativo: ativo.toLowerCase() === 'true'
      };
      
      // Verificar se produto já existe (por SKU)
      const produtoExistente = produtosPiso.find(p => p.sku === dadosProduto.sku);
      
      if (produtoExistente) {
        // Atualizar produto existente
        atualizarProdutoPiso(produtoExistente.id, dadosProduto);
        produtosAtualizados++;
      } else {
        // Criar novo produto
        criarProdutoPiso(dadosProduto);
        produtosImportados++;
      }
      
    } catch (error) {
      erros.push(`Linha ${i + 1}: Erro ao processar - ${error}`);
    }
  }
  
  return {
    sucesso: erros.length === 0,
    produtos_importados: produtosImportados,
    produtos_atualizados: produtosAtualizados,
    erros
  };
}