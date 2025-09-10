// Utilitários para cálculos de orçamentos

import { ProdutoPiso, Acessorio, OrcamentoItem } from './types';

// Calcular caixas necessárias para um produto
export function calcularCaixasNecessarias(
  produto: ProdutoPiso,
  areaCliente: number,
  fatorPerda: number = 10
): {
  area_com_perda: number;
  caixas_necessarias: number;
} {
  const area_com_perda = areaCliente * (1 + fatorPerda / 100);
  const caixas_necessarias = Math.ceil(area_com_perda / produto.m2_por_caixa);
  
  return {
    area_com_perda,
    caixas_necessarias
  };
}

// Calcular subtotal de um item do orçamento
export function calcularSubtotalItem(
  produto: ProdutoPiso,
  areaCliente: number,
  fatorPerda: number = 10
): number {
  const { area_com_perda } = calcularCaixasNecessarias(produto, areaCliente, fatorPerda);
  return area_com_perda * produto.preco_m2;
}

// Sugerir acessórios baseado na área total
export function sugerirAcessorios(
  acessorios: Acessorio[],
  areaTotalM2: number
): Array<{ acessorio: Acessorio; quantidade_sugerida: number; justificativa: string }> {
  const sugestoes: Array<{ acessorio: Acessorio; quantidade_sugerida: number; justificativa: string }> = [];
  
  acessorios.forEach(acessorio => {
    if (!acessorio.ativo) return;
    
    let quantidade = 0;
    let justificativa = '';
    
    switch (acessorio.tipo) {
      case 'argamassa':
        // 1 saco de 20kg para cada 4-5 m²
        quantidade = Math.ceil(areaTotalM2 / 4.5);
        justificativa = `1 saco para cada 4-5 m² (${areaTotalM2.toFixed(1)} m²)`;
        break;
        
      case 'rejunte':
        // 1kg para cada 8-10 m²
        quantidade = Math.ceil(areaTotalM2 / 9);
        justificativa = `1kg para cada 8-10 m² (${areaTotalM2.toFixed(1)} m²)`;
        break;
        
      case 'cunha':
        // 1 pacote para cada 15-20 m²
        quantidade = Math.ceil(areaTotalM2 / 17.5);
        justificativa = `1 pacote para cada 15-20 m² (${areaTotalM2.toFixed(1)} m²)`;
        break;
        
      case 'espaçador':
        // 1 pacote para cada 10-12 m²
        quantidade = Math.ceil(areaTotalM2 / 11);
        justificativa = `1 pacote para cada 10-12 m² (${areaTotalM2.toFixed(1)} m²)`;
        break;
        
      case 'rodapé':
        // Estimar perímetro baseado na área (aproximação)
        const perimetroEstimado = Math.sqrt(areaTotalM2) * 4;
        quantidade = Math.ceil(perimetroEstimado);
        justificativa = `Estimativa baseada no perímetro (~${perimetroEstimado.toFixed(1)}m)`;
        break;
    }
    
    if (quantidade > 0) {
      sugestoes.push({
        acessorio,
        quantidade_sugerida: quantidade,
        justificativa
      });
    }
  });
  
  return sugestoes;
}

// Gerar mensagem para WhatsApp
export function gerarMensagemWhatsApp(
  cliente: { nome: string; telefone: string; cidade: string },
  itens: Array<{
    produto: ProdutoPiso;
    area_cliente_m2: number;
    fator_perda_percent: number;
    caixas_necessarias: number;
    subtotal: number;
  }>,
  acessoriosSelecionados: Array<{
    acessorio: Acessorio;
    quantidade: number;
    subtotal: number;
  }>,
  totais: {
    area_total_m2: number;
    valor_produtos: number;
    valor_acessorios: number;
    frete: number;
    desconto: number;
    valor_final: number;
  },
  prazoEstimado: number,
  observacoes?: string
): string {
  let mensagem = `🏠 *ORÇAMENTO PORCELARTE*\n\n`;
  mensagem += `👤 *Cliente:* ${cliente.nome}\n`;
  mensagem += `📍 *Cidade:* ${cliente.cidade}\n`;
  mensagem += `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  
  mensagem += `📦 *PRODUTOS:*\n`;
  itens.forEach((item, index) => {
    mensagem += `${index + 1}. *${item.produto.nome}*\n`;
    mensagem += `   • Dimensão: ${item.produto.dimensao_cm_ladoA}×${item.produto.dimensao_cm_ladoB}cm\n`;
    mensagem += `   • Área: ${item.area_cliente_m2}m² (+${item.fator_perda_percent}% perda)\n`;
    mensagem += `   • Caixas: ${item.caixas_necessarias} (${item.produto.m2_por_caixa.toFixed(3)}m²/caixa)\n`;
    mensagem += `   • Preço: R$ ${item.produto.preco_m2.toFixed(2)}/m²\n`;
    mensagem += `   • Subtotal: R$ ${item.subtotal.toFixed(2)}\n\n`;
  });
  
  if (acessoriosSelecionados.length > 0) {
    mensagem += `🔧 *ACESSÓRIOS:*\n`;
    acessoriosSelecionados.forEach((item, index) => {
      mensagem += `${index + 1}. *${item.acessorio.nome}*\n`;
      mensagem += `   • Quantidade: ${item.quantidade}\n`;
      mensagem += `   • Preço unit: R$ ${item.acessorio.preco_unit.toFixed(2)}\n`;
      mensagem += `   • Subtotal: R$ ${item.subtotal.toFixed(2)}\n\n`;
    });
  }
  
  mensagem += `💰 *RESUMO FINANCEIRO:*\n`;
  mensagem += `• Área total: ${totais.area_total_m2.toFixed(2)}m²\n`;
  mensagem += `• Produtos: R$ ${totais.valor_produtos.toFixed(2)}\n`;
  if (totais.valor_acessorios > 0) {
    mensagem += `• Acessórios: R$ ${totais.valor_acessorios.toFixed(2)}\n`;
  }
  if (totais.frete > 0) {
    mensagem += `• Frete: R$ ${totais.frete.toFixed(2)}\n`;
  }
  if (totais.desconto > 0) {
    mensagem += `• Desconto: -R$ ${totais.desconto.toFixed(2)}\n`;
  }
  mensagem += `• *TOTAL: R$ ${totais.valor_final.toFixed(2)}*\n\n`;
  
  mensagem += `⏱️ *Prazo estimado:* ${prazoEstimado} dias úteis\n\n`;
  
  if (observacoes) {
    mensagem += `📝 *Observações:*\n${observacoes}\n\n`;
  }
  
  mensagem += `✅ Orçamento válido por 15 dias\n`;
  mensagem += `📞 Dúvidas? Entre em contato!\n\n`;
  mensagem += `*Porcelarte - Qualidade em Pisos*`;
  
  return mensagem;
}

// Validar se orçamento pode ser aprovado (verificar estoque)
export function validarAprovacaoOrcamento(
  itens: Array<{
    produto: ProdutoPiso;
    caixas_necessarias: number;
  }>
): {
  pode_aprovar: boolean;
  erros: string[];
} {
  const erros: string[] = [];
  
  itens.forEach(item => {
    if (!item.produto.ativo) {
      erros.push(`${item.produto.nome} está inativo`);
    } else if (item.produto.estoque_caixas < item.caixas_necessarias) {
      erros.push(
        `${item.produto.nome}: precisa de ${item.caixas_necessarias} caixas, disponível ${item.produto.estoque_caixas}`
      );
    }
  });
  
  return {
    pode_aprovar: erros.length === 0,
    erros
  };
}

// Formatar valor monetário
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Formatar área
export function formatarArea(area: number): string {
  return `${area.toFixed(2)}m²`;
}