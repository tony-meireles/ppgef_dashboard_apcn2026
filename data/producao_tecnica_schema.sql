CREATE TABLE producao_tecnica (
    id INTEGER PRIMARY KEY,
    docente TEXT NOT NULL,
    autores TEXT,
    ano INTEGER,
    titulo TEXT NOT NULL,
    categoria TEXT,
    tipo_produto TEXT NOT NULL,
    subtipo TEXT,
    formato TEXT,
    finalidade TEXT,
    local TEXT,
    cidade TEXT,
    total_produtos INTEGER NOT NULL DEFAULT 1,
    pagina_pdf INTEGER,
    fonte_pdf TEXT,
    observacoes TEXT
);
