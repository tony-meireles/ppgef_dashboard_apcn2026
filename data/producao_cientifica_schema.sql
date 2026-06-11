CREATE TABLE producao_cientifica (
    id INTEGER PRIMARY KEY,
    docente TEXT NOT NULL,
    autor_principal TEXT NOT NULL,
    ano INTEGER NOT NULL,
    titulo TEXT,
    tipo_producao TEXT NOT NULL CHECK (tipo_producao IN ('artigo', 'livro', 'capitulo')),
    revista_ou_veiculo TEXT,
    editora TEXT,
    cidade TEXT,
    isbn_issn TEXT,
    doi TEXT,
    url TEXT,
    indexacao TEXT,
    jif_jcr_2025 REAL,
    quartil_jcr_2025 TEXT,
    pontuacao INTEGER,
    observacoes TEXT
);
