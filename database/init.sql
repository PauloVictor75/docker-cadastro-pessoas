-- Cria a tabela de pessoas.
-- O banco "cadastro" já é criado automaticamente pela variável MYSQL_DATABASE.

CREATE TABLE IF NOT EXISTS pessoas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(255),
    logradouro VARCHAR(255),
    bairro VARCHAR(255),
    localidade VARCHAR(255),
    uf VARCHAR(2),
    estado VARCHAR(100),
    rua VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
