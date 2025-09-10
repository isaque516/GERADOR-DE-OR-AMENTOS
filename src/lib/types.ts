// Tipos para o sistema de autenticação e gestão de produtos

// ===== AUTENTICAÇÃO =====
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha_hash?: string; // Não expor no frontend
  perfil: 'admin' | 'vendedor';
  ativo: boolean;
  criado_em: Date;
  ultimo_login_em?: Date;
}

export interface SessaoUsuario {
  usuario: Usuario;
  token: string;
  expira_em: Date;
}

// ===== PRODUTOS =====
export interface ProdutoPiso {
  id: string;
  sku: string;
  nome: string;
  dimensao_cm_ladoA: number;
  dimensao_cm_ladoB: number;
  pecas_por_caixa: number;
  m2_por_caixa: number; // Calculado automaticamente
  acabamento: 'fosco' | 'polido';
  colecao_cor: string;
  preco_m2: number;
  estoque_caixas: number;
  estoque_min_caixas: number;
  ativo: boolean;
  atualizado_em: Date;
}

export interface Acessorio {
  id: string;
  sku: string;
  nome: string;
  tipo: 'argamassa' | 'rejunte' | 'cunha' | 'espaçador' | 'rodapé';
  preco_unit: number;
  estoque_unidades: number;
  estoque_min_unidades: number;
  ativo: boolean;
  atualizado_em: Date;
  // Campos para cálculo de sugestões
  rendimento_un_medida?: string;
}

// ===== MOVIMENTAÇÕES DE ESTOQUE =====
export interface MovimentacaoEstoque {
  id: string;
  produto_tipo: 'piso' | 'acessorio';
  produto_id: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  motivo: string;
  usuario_id: string;
  usuario?: Usuario;
  criado_em: Date;
}

// ===== ORÇAMENTOS (mantendo compatibilidade) =====
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cep: string;
}

export interface OrcamentoItem {
  id: string;
  orcamento_id: string;
  produto_id: string;
  produto?: ProdutoPiso;
  area_cliente_m2: number;
  fator_perda_percent: number;
  area_com_perda_m2: number;
  caixas_necessarias: number;
  preco_m2_snapshot: number;
  subtotal: number;
}

export interface AcessorioSelecionado {
  acessorio: Acessorio;
  quantidade: number;
  subtotal: number;
}

export interface Orcamento {
  id: string;
  dataHora: Date;
  vendedor_id: string;
  vendedor: Usuario;
  cliente_id: string;
  cliente: Cliente;
  itens: OrcamentoItem[];
  area_total_m2: number;
  valor_produtos: number;
  valor_acessorios: number;
  frete: number;
  desconto: number;
  valor_final: number;
  prazo_estimado_dias: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'cancelado';
  observacoes?: string;
}

// ===== FILTROS E BUSCA =====
export interface FiltrosProdutos {
  search?: string;
  acabamento?: 'fosco' | 'polido' | '';
  ativo?: boolean | '';
  estoque_baixo?: boolean;
}

export interface FiltrosMovimentacoes {
  produto_id?: string;
  produto_tipo?: 'piso' | 'acessorio' | '';
  tipo?: 'entrada' | 'saida' | 'ajuste' | '';
  data_inicio?: Date;
  data_fim?: Date;
  usuario_id?: string;
}

// ===== RELATÓRIOS =====
export interface ProdutoParaRepor {
  produto: ProdutoPiso | Acessorio;
  tipo: 'piso' | 'acessorio';
  estoque_atual: number;
  estoque_min: number;
  sugestao_compra: number;
}

// ===== IMPORTAÇÃO CSV =====
export interface ResultadoImportacao {
  sucesso: boolean;
  produtos_importados: number;
  produtos_atualizados: number;
  erros: string[];
}

// ===== VALIDAÇÕES =====
export interface ValidacaoEstoque {
  produto_id: string;
  disponivel: boolean;
  estoque_atual: number;
  quantidade_solicitada: number;
  mensagem?: string;
}

// ===== STATUS DE ESTOQUE =====
export type StatusEstoque = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

export interface StatusEstoqueInfo {
  status: StatusEstoque;
  mensagem: string;
  cor_badge: string;
}