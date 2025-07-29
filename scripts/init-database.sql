-- Criação das tabelas do sistema de estoque

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_produto TEXT UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de códigos de barras
CREATE TABLE IF NOT EXISTS codigos_de_barras (
    codigo_de_barras TEXT PRIMARY KEY,
    produto_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- Tabela de contagens
CREATE TABLE IF NOT EXISTS contagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    data_contagem DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'em_andamento',
    observacoes TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de itens contados
CREATE TABLE IF NOT EXISTS itens_contados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contagem_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    codigo_de_barras TEXT NOT NULL,
    quantidade_contada INTEGER NOT NULL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contagem_id) REFERENCES contagens(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (codigo_de_barras) REFERENCES codigos_de_barras(codigo_de_barras)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo_produto);
CREATE INDEX IF NOT EXISTS idx_codigos_barras ON codigos_de_barras(codigo_de_barras);
CREATE INDEX IF NOT EXISTS idx_contagens_usuario ON contagens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_itens_contagem ON itens_contados(contagem_id);

-- Inserir usuário padrão (senha: admin123)
INSERT OR IGNORE INTO usuarios (email, senha_hash) 
VALUES ('admin@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Inserir produtos de exemplo
INSERT OR IGNORE INTO produtos (codigo_produto, descricao) VALUES
('113639', 'AGUA H2O LIMONETO 500ML'),
('113640', 'REFRIGERANTE COLA 350ML'),
('113641', 'SUCO LARANJA 1L'),
('113642', 'BISCOITO CHOCOLATE 200G'),
('113643', 'LEITE INTEGRAL 1L');

-- Inserir códigos de barras de exemplo
INSERT OR IGNORE INTO codigos_de_barras (codigo_de_barras, produto_id) VALUES
('7892840812850', 1),
('7892840812851', 2),
('7892840812852', 3),
('7892840812853', 4),
('7892840812854', 5);
