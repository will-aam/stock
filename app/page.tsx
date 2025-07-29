"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Scan,
  Download,
  History,
  LogOut,
  Plus,
  Trash2,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: number;
  codigo_produto: string;
  descricao: string;
}

interface BarCode {
  codigo_de_barras: string;
  produto_id: number;
  produto?: Product;
}

interface CountedItem {
  id: string;
  codigo_de_barras: string;
  codigo_produto: string;
  descricao: string;
  quantidade: number;
  data_hora: string;
}

interface User {
  id: number;
  email: string;
}

export default function InventorySystem() {
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [barCodes, setBarCodes] = useState<BarCode[]>([]);
  const [countedItems, setCountedItems] = useState<CountedItem[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simular dados iniciais
  useEffect(() => {
    const mockProducts = [
      { id: 1, codigo_produto: "113639", descricao: "AGUA H2O LIMONETO 500ML" },
      { id: 2, codigo_produto: "113640", descricao: "REFRIGERANTE COLA 350ML" },
      { id: 3, codigo_produto: "113641", descricao: "SUCO LARANJA 1L" },
    ];

    const mockBarCodes = [
      {
        codigo_de_barras: "7892840812850",
        produto_id: 1,
        produto: mockProducts[0],
      },
      {
        codigo_de_barras: "7892840812851",
        produto_id: 2,
        produto: mockProducts[1],
      },
      {
        codigo_de_barras: "7892840812852",
        produto_id: 3,
        produto: mockProducts[2],
      },
    ];

    setProducts(mockProducts);
    setBarCodes(mockBarCodes);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular login
    setTimeout(() => {
      if (loginForm.email && loginForm.password) {
        setUser({ id: 1, email: loginForm.email });
        toast({ title: "Login realizado com sucesso!" });
      } else {
        toast({
          title: "Erro",
          description: "Email e senha são obrigatórios",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "Senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setUser({ id: 1, email: registerForm.email });
      toast({ title: "Conta criada com sucesso!" });
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    setLoginForm({ email: "", password: "" });
    setRegisterForm({ email: "", password: "", confirmPassword: "" });
    setCountedItems([]);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      processCsvFile(file);
    }
  };

  const processCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const errors: string[] = [];
      const newProducts: Product[] = [];
      const newBarCodes: BarCode[] = [];
      const existingBarCodes = new Set(
        barCodes.map((bc) => bc.codigo_de_barras)
      );

      lines.forEach((line, index) => {
        const [codigo_de_barras, codigo_produto, descricao] = line.split(";");

        if (!codigo_de_barras || !codigo_produto || !descricao) {
          errors.push(`Linha ${index + 1}: Dados incompletos`);
          return;
        }

        if (existingBarCodes.has(codigo_de_barras)) {
          errors.push(
            `Linha ${index + 1}: Código de barras ${codigo_de_barras} duplicado`
          );
          return;
        }

        const product = { id: Date.now() + index, codigo_produto, descricao };
        newProducts.push(product);
        newBarCodes.push({
          codigo_de_barras,
          produto_id: product.id,
          produto: product,
        });
        existingBarCodes.add(codigo_de_barras);
      });

      setCsvErrors(errors);
      if (errors.length === 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setBarCodes((prev) => [...prev, ...newBarCodes]);
        toast({
          title: `${newProducts.length} produtos importados com sucesso!`,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleScan = () => {
    const barCode = barCodes.find((bc) => bc.codigo_de_barras === scanInput);
    if (barCode && barCode.produto) {
      setCurrentProduct(barCode.produto);
      toast({
        title: "Produto encontrado!",
        description: barCode.produto.descricao,
      });
    } else {
      toast({
        title: "Produto não encontrado",
        description: "Código de barras não cadastrado",
        variant: "destructive",
      });
      setCurrentProduct(null);
    }
  };

  const handleAddCount = () => {
    if (!currentProduct || !quantityInput) {
      toast({
        title: "Erro",
        description: "Selecione um produto e informe a quantidade",
        variant: "destructive",
      });
      return;
    }

    const newItem: CountedItem = {
      id: Date.now().toString(),
      codigo_de_barras: scanInput,
      codigo_produto: currentProduct.codigo_produto,
      descricao: currentProduct.descricao,
      quantidade: Number.parseInt(quantityInput),
      data_hora: new Date().toLocaleString("pt-BR"),
    };

    setCountedItems((prev) => [...prev, newItem]);
    setScanInput("");
    setQuantityInput("");
    setCurrentProduct(null);
    toast({ title: "Item adicionado à contagem!" });
  };

  const handleRemoveCount = (id: string) => {
    setCountedItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Item removido da contagem" });
  };

  const exportToCsv = () => {
    const headers =
      "descricao;codigo_produto;codigo_de_barras_lido;quantidade_contada;data_hora\n";
    const csvContent = countedItems
      .map((item) => {
        // Remove quebras de linha e coloca aspas na descrição
        const descricao = `"${item.descricao.replace(/\r?\n|\r/g, " ")}"`;
        return `${descricao};${item.codigo_produto};${item.codigo_de_barras};${item.quantidade};${item.data_hora}`;
      })
      .join("\n");

    const blob = new Blob([headers + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contagem_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "CSV exportado com sucesso!" });
  };

  const exportToPdf = () => {
    // Simular exportação PDF
    toast({ title: "PDF exportado com sucesso!" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Sistema de Estoque
            </CardTitle>
            <CardDescription>
              {isRegistering ? "Criar nova conta" : "Faça login para continuar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={isRegistering ? handleRegister : handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={isRegistering ? registerForm.email : loginForm.email}
                  onChange={(e) =>
                    isRegistering
                      ? setRegisterForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      : setLoginForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={
                    isRegistering ? registerForm.password : loginForm.password
                  }
                  onChange={(e) =>
                    isRegistering
                      ? setRegisterForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      : setLoginForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                  }
                  required
                />
              </div>
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Carregando..."
                  : isRegistering
                  ? "Criar Conta"
                  : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm"
              >
                {isRegistering
                  ? "Já tem conta? Faça login"
                  : "Não tem conta? Registre-se"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Sistema de Estoque
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scan">Conferência</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="h-5 w-5 mr-2" />
                    Scanner de Código de Barras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="barcode"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="Digite ou escaneie o código"
                        className="flex-1"
                      />
                      <Button onClick={handleScan}>
                        <Scan className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {currentProduct && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800">
                        Produto Encontrado
                      </h3>
                      <p className="text-sm text-green-700">
                        {currentProduct.descricao}
                      </p>
                      <p className="text-xs text-green-600">
                        Código: {currentProduct.codigo_produto}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade Contada</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      placeholder="Digite a quantidade"
                      min="0"
                    />
                  </div>

                  <Button
                    onClick={handleAddCount}
                    className="w-full"
                    disabled={!currentProduct || !quantityInput}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar à Contagem
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Itens Contados ({countedItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {countedItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhum item contado ainda
                      </p>
                    ) : (
                      countedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.descricao}
                            </p>
                            <p className="text-xs text-gray-600">
                              Código: {item.codigo_produto} | Qtd:{" "}
                              {item.quantidade}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCount(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Importar Produtos
                </CardTitle>
                <CardDescription>
                  Faça upload de um arquivo CSV com formato:
                  codigo_de_barras;codigo_produto;descricao
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Arquivo CSV</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                  />
                </div>

                {csvErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-semibold">Erros encontrados:</p>
                        {csvErrors.map((error, index) => (
                          <p key={index} className="text-sm">
                            {error}
                          </p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-gray-600">
                  <p className="font-semibold">
                    Produtos cadastrados: {products.length}
                  </p>
                  <p>Códigos de barras: {barCodes.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Código de Barras</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const barCode = barCodes.find(
                          (bc) => bc.produto_id === product.id
                        );
                        return (
                          <TableRow key={product.id}>
                            <TableCell>{product.codigo_produto}</TableCell>
                            <TableCell>{product.descricao}</TableCell>
                            <TableCell>
                              {barCode?.codigo_de_barras || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Contagem
                </CardTitle>
                <CardDescription>
                  Exporte os dados da contagem atual em CSV ou PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    onClick={exportToCsv}
                    disabled={countedItems.length === 0}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button
                    onClick={exportToPdf}
                    disabled={countedItems.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800">
                    Resumo da Contagem
                  </h3>
                  <p className="text-sm text-blue-700">
                    Total de itens: {countedItems.length}
                  </p>
                  <p className="text-sm text-blue-700">
                    Quantidade total:{" "}
                    {countedItems.reduce(
                      (sum, item) => sum + item.quantidade,
                      0
                    )}
                  </p>
                </div>

                {countedItems.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Data/Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.descricao}
                            </TableCell>
                            <TableCell>{item.codigo_produto}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell className="text-sm">
                              {item.data_hora}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Histórico de Contagens
                </CardTitle>
                <CardDescription>
                  Visualize o histórico de contagens anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum histórico disponível</p>
                  <p className="text-sm">
                    As contagens aparecerão aqui após serem finalizadas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
