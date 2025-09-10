"use client";

import { Badge } from '@/components/ui/badge';
import { ProdutoPiso, Acessorio } from '@/lib/types';
import { obterStatusEstoque } from '@/lib/utils-estoque';

interface BadgeEstoqueProps {
  produto: ProdutoPiso | Acessorio;
  quantidadeSolicitada?: number;
}

export default function BadgeEstoque({ produto, quantidadeSolicitada }: BadgeEstoqueProps) {
  const statusInfo = obterStatusEstoque(produto, quantidadeSolicitada);
  
  return (
    <Badge 
      variant="outline" 
      className={`${statusInfo.cor_badge} text-xs font-medium`}
      title={statusInfo.mensagem}
    >
      {statusInfo.status === 'verde' && '✓ OK'}
      {statusInfo.status === 'amarelo' && '⚠ Baixo'}
      {statusInfo.status === 'vermelho' && '✗ Sem estoque'}
      {statusInfo.status === 'cinza' && '○ Inativo'}
    </Badge>
  );
}