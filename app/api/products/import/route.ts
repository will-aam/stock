import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const errors: string[] = []
    const products: any[] = []
    const barCodes: any[] = []

    lines.forEach((line, index) => {
      const [codigo_de_barras, codigo_produto, descricao] = line.split(";")

      if (!codigo_de_barras || !codigo_produto || !descricao) {
        errors.push(`Linha ${index + 1}: Dados incompletos`)
        return
      }

      // Verificar duplicações (implementar verificação real no banco)

      products.push({
        id: Date.now() + index,
        codigo_produto: codigo_produto.trim(),
        descricao: descricao.trim(),
      })

      barCodes.push({
        codigo_de_barras: codigo_de_barras.trim(),
        produto_id: Date.now() + index,
      })
    })

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Salvar no banco de dados (implementar)

    return NextResponse.json({
      message: `${products.length} produtos importados com sucesso`,
      products,
      barCodes,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 })
  }
}
