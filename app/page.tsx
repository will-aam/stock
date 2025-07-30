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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Scan,
  Download,
  History,
  LogOut,
  Plus,
  Trash2,
  FileSpreadsheet,
  Store,
  Calculator,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Papa, { type ParseResult } from "papaparse";

// AJUSTE: Importação do novo componente de tema
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

// --- Interfaces existentes ---
interface Product {
  id: number;
  codigo_produto: string;
  descricao: string;
  saldo_estoque: number;
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
  saldo_estoque: number;
  quantidade_contada: number;
  total: number;
  local_estoque: string;
  data_hora: string;
}

interface User {
  id: number;
  email: string;
}

interface InventoryHistory {
  id: number;
  data_contagem: string;
  usuario_email: string;
  total_itens: number;
  local_estoque: string;
  status: string;
}

interface CsvRow {
  codigo_de_barras: string;
  codigo_produto: string;
  descricao: string;
  saldo_estoque: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function InventorySystem() {
  // AJUSTE: useTheme foi movido para o componente ThemeToggleButton
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
  const [selectedLocation, setSelectedLocation] = useState("loja-1");
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory[]>(
    []
  );

  const locations = [
    { value: "loja-1", label: "Loja 1" },
    { value: "loja-2", label: "Loja 2" },
    { value: "deposito", label: "Depósito" },
    { value: "estoque-central", label: "Estoque Central" },
  ];

  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        codigo_produto: "113639",
        descricao: "AGUA H2O LIMONETO 500ML",
        saldo_estoque: 50,
      },
      {
        id: 2,
        codigo_produto: "113640",
        descricao: "REFRIGERANTE COLA 350ML",
        saldo_estoque: 30,
      },
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
    ];
    const mockHistory = [
      {
        id: 1,
        data_contagem: "2024-01-15 14:30:00",
        usuario_email: "admin@sistema.com",
        total_itens: 15,
        local_estoque: "loja-1",
        status: "concluida",
      },
    ];
    setProducts(mockProducts);
    setBarCodes(mockBarCodes);
    setInventoryHistory(mockHistory);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha no login",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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
    Papa.parse<CsvRow>(file, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        console.log("Dados do CSV:", results.data);

        const errors: string[] = [];
        const newProducts: Product[] = [];
        const newBarCodes: BarCode[] = [];
        const existingBarCodes = new Set(
          barCodes.map((bc) => bc.codigo_de_barras)
        );

        results.data.forEach((row: CsvRow, index: number) => {
          const { codigo_de_barras, codigo_produto, descricao, saldo_estoque } =
            row;
          if (
            !codigo_de_barras ||
            !codigo_produto ||
            !descricao ||
            saldo_estoque === undefined
          ) {
            errors.push(`Linha ${index + 2}: Dados incompletos`);
            return;
          }
          if (existingBarCodes.has(codigo_de_barras)) {
            errors.push(
              `Linha ${
                index + 2
              }: Código de barras ${codigo_de_barras} duplicado`
            );
            return;
          }
          const saldoNumerico = Number.parseInt(saldo_estoque);
          if (isNaN(saldoNumerico)) {
            errors.push(
              `Linha ${
                index + 2
              }: Saldo de estoque '${saldo_estoque}' deve ser um número`
            );
            return;
          }
          const product = {
            id: Date.now() + index,
            codigo_produto,
            descricao,
            saldo_estoque: saldoNumerico,
          };
          newProducts.push(product);
          newBarCodes.push({
            codigo_de_barras,
            produto_id: product.id,
            produto: product,
          });
          existingBarCodes.add(codigo_de_barras);
        });

        setCsvErrors(errors);
        if (errors.length === 0 && newProducts.length > 0) {
          setProducts((prev) => [...prev, ...newProducts]);
          setBarCodes((prev) => [...prev, ...newBarCodes]);
          toast({
            title: `${newProducts.length} produtos importados com sucesso!`,
          });
        } else if (errors.length > 0) {
          toast({
            title: "Erro na importação",
            description: "Verifique os erros listados.",
            variant: "destructive",
          });
        }
      },
      error: (err: Error, file: File) => {
        console.error("Erro ao processar o arquivo:", file.name, err);
        toast({
          title: "Erro de Processamento",
          description: `Falha ao ler o arquivo: ${err.message}`,
          variant: "destructive",
        });
      },
    });
  };

  const handleScan = () => {
    const barCode = barCodes.find((bc) => bc.codigo_de_barras === scanInput);
    if (barCode && barCode.produto) {
      setCurrentProduct(barCode.produto);
      toast({
        title: "Produto encontrado!",
        description: `${barCode.produto.descricao} - Estoque: ${barCode.produto.saldo_estoque}`,
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

  const calculateTotal = (quantidadeContada: number, saldoEstoque: number) => {
    return quantidadeContada - saldoEstoque;
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
    const quantidade = Number.parseInt(quantityInput);
    const total = calculateTotal(quantidade, currentProduct.saldo_estoque);
    const newItem: CountedItem = {
      id: Date.now().toString(),
      codigo_de_barras: scanInput,
      codigo_produto: currentProduct.codigo_produto,
      descricao: currentProduct.descricao,
      saldo_estoque: currentProduct.saldo_estoque,
      quantidade_contada: quantidade,
      total: total,
      local_estoque: selectedLocation,
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
    if (countedItems.length === 0) {
      toast({ title: "Nenhum item para exportar", variant: "destructive" });
      return;
    }
    const dataToExport = countedItems.map((item) => ({
      codigo_de_barras: item.codigo_de_barras,
      codigo_produto: item.codigo_produto,
      descricao: item.descricao,
      saldo_estoque: item.saldo_estoque,
      quantidade_contada: item.quantidade_contada,
      total: item.total,
    }));
    const csv = Papa.unparse(dataToExport, {
      header: true,
      delimiter: ";",
      quotes: true,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contagem_${selectedLocation}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    toast({ title: "CSV exportado com sucesso!" });
  };

  const getTotalVariance = () => {
    return countedItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getVarianceColor = (total: number) => {
    if (total > 0) return "text-green-600";
    if (total < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                Sistema de Estoque
              </CardTitle>
              {/* AJUSTE: Botão de tema substituído pelo componente */}
              <ThemeToggleButton />
            </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sistema de Estoque
            </h1>
            <div className="flex items-center space-x-4">
              {/* AJUSTE: Botão de tema substituído pelo componente */}
              <ThemeToggleButton />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Olá, {user.email}
              </span>
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
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="h-5 w-5 mr-2" />
                    Scanner de Código de Barras
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4" />
                      <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem
                              key={location.value}
                              value={location.value}
                            >
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardDescription>
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
                        className="flex-1 mobile-optimized"
                        onKeyPress={(e) => e.key === "Enter" && handleScan()}
                      />
                      <Button onClick={handleScan}>
                        <Scan className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {currentProduct && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 dark:text-green-200">
                            Produto Encontrado
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {currentProduct.descricao}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Código: {currentProduct.codigo_produto}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Estoque: {currentProduct.saldo_estoque}
                        </Badge>
                      </div>
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
                      className="mobile-optimized"
                    />
                  </div>

                  {currentProduct && quantityInput && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Diferença:</span>
                        <span
                          className={`font-bold ${getVarianceColor(
                            calculateTotal(
                              Number.parseInt(quantityInput),
                              currentProduct.saldo_estoque
                            )
                          )}`}
                        >
                          {calculateTotal(
                            Number.parseInt(quantityInput),
                            currentProduct.saldo_estoque
                          ) > 0
                            ? "+"
                            : ""}
                          {calculateTotal(
                            Number.parseInt(quantityInput),
                            currentProduct.saldo_estoque
                          )}
                        </span>
                      </div>
                    </div>
                  )}

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
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Itens Contados ({countedItems.length})
                    </CardTitle>
                    {countedItems.length > 0 && (
                      <Badge
                        variant={
                          getTotalVariance() === 0
                            ? "secondary"
                            : getTotalVariance() > 0
                            ? "default"
                            : "destructive"
                        }
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Total: {getTotalVariance() > 0 ? "+" : ""}
                        {getTotalVariance()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {countedItems.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        Nenhum item contado ainda
                      </p>
                    ) : (
                      countedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.descricao}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Código: {item.codigo_produto} | Estoque:{" "}
                              {item.saldo_estoque} | Contado:{" "}
                              {item.quantidade_contada}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={
                                  item.total === 0
                                    ? "secondary"
                                    : item.total > 0
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {item.total > 0 ? "+" : ""}
                                {item.total}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {
                                  locations.find(
                                    (l) => l.value === item.local_estoque
                                  )?.label
                                }
                              </span>
                            </div>
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
                  codigo_de_barras;codigo_produto;descricao;saldo_estoque
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
                    <AlertCircle className="h-4 w-4" />
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

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      Produtos cadastrados
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {products.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Códigos de barras
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {barCodes.length}
                    </p>
                  </div>
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
                        <TableHead>Estoque</TableHead>
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
                            <TableCell className="font-medium">
                              {product.codigo_produto}
                            </TableCell>
                            <TableCell>{product.descricao}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {product.saldo_estoque}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
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
                  Exporte os dados da contagem atual em CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    onClick={exportToCsv}
                    disabled={countedItems.length === 0}
                    className="h-12"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium">
                      Local:{" "}
                      {
                        locations.find((l) => l.value === selectedLocation)
                          ?.label
                      }
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date().toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {countedItems.length}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Itens
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {countedItems.reduce(
                        (sum, item) => sum + item.quantidade_contada,
                        0
                      )}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Quantidade
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-2xl font-bold ${getVarianceColor(
                        getTotalVariance()
                      )}`}
                    >
                      {getTotalVariance() > 0 ? "+" : ""}
                      {getTotalVariance()}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Diferença
                    </p>
                  </div>
                </div>

                {countedItems.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Contado</TableHead>
                          <TableHead>Diferença</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.descricao}
                            </TableCell>
                            <TableCell>{item.codigo_produto}</TableCell>
                            <TableCell>{item.saldo_estoque}</TableCell>
                            <TableCell>{item.quantidade_contada}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.total === 0
                                    ? "secondary"
                                    : item.total > 0
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.total > 0 ? "+" : ""}
                                {item.total}
                              </Badge>
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
                {inventoryHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum histórico disponível</p>
                    <p className="text-sm">
                      As contagens aparecerão aqui após serem finalizadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventoryHistory.map((history) => (
                      <div
                        key={history.id}
                        className="p-4 border dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {new Date(history.data_contagem).toLocaleString(
                                "pt-BR"
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {history.usuario_email} •{" "}
                              {
                                locations.find(
                                  (l) => l.value === history.local_estoque
                                )?.label
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                history.status === "concluida"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {history.status === "concluida" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : null}
                              {history.status}
                            </Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {history.total_itens} itens
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
