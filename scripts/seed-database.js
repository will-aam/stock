// Script para popular o banco de dados com dados de exemplo

const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcryptjs")

const db = new sqlite3.Database("./inventory.db")

async function seedDatabase() {
  console.log("Iniciando população do banco de dados...")

  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash("admin123", 10)

  db.run(
    `
    INSERT OR IGNORE INTO usuarios (email, senha_hash) 
    VALUES (?, ?)
  `,
    ["admin@sistema.com", hashedPassword],
  )

  // Produtos de exemplo
  const produtos = [
    ["113639", "AGUA H2O LIMONETO 500ML"],
    ["113640", "REFRIGERANTE COLA 350ML"],
    ["113641", "SUCO LARANJA 1L"],
    ["113642", "BISCOITO CHOCOLATE 200G"],
    ["113643", "LEITE INTEGRAL 1L"],
    ["113644", "CAFE TORRADO 500G"],
    ["113645", "AÇUCAR CRISTAL 1KG"],
    ["113646", "ARROZ BRANCO 5KG"],
    ["113647", "FEIJAO PRETO 1KG"],
    ["113648", "MACARRAO ESPAGUETE 500G"],
  ]

  // Códigos de barras correspondentes
  const codigosBarras = [
    ["7892840812850", 1],
    ["7892840812851", 2],
    ["7892840812852", 3],
    ["7892840812853", 4],
    ["7892840812854", 5],
    ["7892840812855", 6],
    ["7892840812856", 7],
    ["7892840812857", 8],
    ["7892840812858", 9],
    ["7892840812859", 10],
  ]

  // Inserir produtos
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO produtos (codigo_produto, descricao) 
    VALUES (?, ?)
  `)

  produtos.forEach((produto) => {
    insertProduct.run(produto)
  })

  insertProduct.finalize()

  // Inserir códigos de barras
  const insertBarcode = db.prepare(`
    INSERT OR IGNORE INTO codigos_de_barras (codigo_de_barras, produto_id) 
    VALUES (?, ?)
  `)

  codigosBarras.forEach((codigo) => {
    insertBarcode.run(codigo)
  })

  insertBarcode.finalize()

  console.log("Banco de dados populado com sucesso!")
  console.log(`- ${produtos.length} produtos inseridos`)
  console.log(`- ${codigosBarras.length} códigos de barras inseridos`)
  console.log("- Usuário admin criado (email: admin@sistema.com, senha: admin123)")

  db.close()
}

seedDatabase().catch(console.error)
