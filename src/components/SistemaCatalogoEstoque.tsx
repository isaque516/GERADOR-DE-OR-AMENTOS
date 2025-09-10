"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  User, 
  LogOut, 
  Package, 
  Wrench, 
  BarChart3, 
  ShoppingCart,
  Settings,
  FileText
} from 'lucide-react';
import { Usuario } from '@/lib/types';
import { temPermissao } from '@/lib/auth';
import CatalogoProdutos from '@/components/CatalogoProdutos';
import MovimentacoesEstoque from '@/components/MovimentacoesEstoque';
import ListaOrcamentos from '@/components/ListaOrcamentos';

interface SistemaCatalogoEstoqueProps {
  usuario: Usuario;
  onLogout: () => void;
}

export default function SistemaCatalogoEstoque({ usuario, onLogout }: SistemaCatalogoEstoqueProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('orcamentos');

  const podeGerenciarCatalogo = temPermissao(usuario, 'editar_catalogo');
  const podeGerenciarEstoque = temPermissao(usuario, 'editar_estoque');

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-blue-950">
      {/* Header */}
      <div className="bg-white dark:bg-blue-900 border-b border-blue-200 dark:border-blue-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">Porcelarte</h1>
                <p className="text-sm text-blue-600 dark:text-blue-300">Sistema de Gestão</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {usuario.nome}
                </p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    usuario.perfil === 'admin' 
                      ? 'border-green-200 text-green-700 bg-green-50' 
                      : 'border-blue-200 text-blue-700 bg-blue-50'
                  }`}
                >
                  {usuario.perfil === 'admin' ? 'Administrador' : 'Vendedor'}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            <TabsTrigger value="orcamentos" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orçamentos
            </TabsTrigger>
            
            {podeGerenciarCatalogo && (
              <TabsTrigger value="catalogo" className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Catálogo
              </TabsTrigger>
            )}
            
            {podeGerenciarEstoque && (
              <TabsTrigger value="estoque" className="flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                Estoque
              </TabsTrigger>
            )}
            
            <TabsTrigger value="relatorios" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Aba Orçamentos */}
          <TabsContent value="orcamentos">
            <ListaOrcamentos usuario={usuario} />
          </TabsContent>

          {/* Aba Catálogo (apenas Admin) */}
          {podeGerenciarCatalogo && (
            <TabsContent value="catalogo">
              <CatalogoProdutos usuario={usuario} />
            </TabsContent>
          )}

          {/* Aba Estoque (apenas Admin) */}
          {podeGerenciarEstoque && (
            <TabsContent value="estoque">
              <MovimentacoesEstoque usuario={usuario} />
            </TabsContent>
          )}

          {/* Aba Relatórios */}
          <TabsContent value="relatorios">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Orçamentos do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    +12% em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Produtos Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">156</div>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    12 com estoque baixo
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Vendas do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">R$ 45.2k</div>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Meta: R$ 50k (90%)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Produtos para Repor */}
            <Card className="mt-6 bg-white dark:bg-blue-900 border-blue-100 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  Produtos para Repor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        Mármore Carrara 90×90
                      </h4>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        Estoque: 5 caixas (mín: 15)
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Sugestão: 25 caixas
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                        Rejunte Cinza 1kg
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Estoque: 28 unidades (mín: 30)
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Sugestão: 32 unidades
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}