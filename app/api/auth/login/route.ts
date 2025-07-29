import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Simulação de banco de dados
const users = [
  {
    id: 1,
    email: "admin@sistema.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "24h",
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
