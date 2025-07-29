import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Verificar se usuário já existe (simulação)
    const existingUser = false // Implementar verificação real

    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário (simulação)
    const newUser = {
      id: Date.now(),
      email,
      password: hashedPassword,
    }

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "24h",
    })

    return NextResponse.json({
      user: { id: newUser.id, email: newUser.email },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
