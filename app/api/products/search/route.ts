import { type NextRequest, NextResponse } from "next/server"

// Simulação de dados
const products = [
  { id: 1, codigo_produto: "113639", descricao: "AGUA H2O LIMONETO 500ML" },
  { id: 2, codigo_produto: "113640", descricao: "REFRIGERANTE COLA 350ML" },
  { id: 3, codigo_produto: "113641", descricao: "SUCO LARANJA 1L" },
]

const barCodes = [
  { codigo_de_barras: "7892840812850", produto_id: 1 },
  { codigo_de_barras: "7892840812851", produto_id: 2 },
  { codigo_de_barras: "7892840812852", produto_id: 3 },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get("barcode")

    if (!barcode) {
      return NextResponse.json({ error: "Código de barras é obrigatório" }, { status: 400 })
    }

    const barCodeEntry = barCodes.find((bc) => bc.codigo_de_barras === barcode)
    if (!barCodeEntry) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const product = products.find((p) => p.id === barCodeEntry.produto_id)
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      produto: product,
      codigo_de_barras: barcode,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
