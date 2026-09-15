# Sistema de Cadastro de Pessoas e Endereços

## 1. Descrição

Aplicação web simples para cadastro e listagem de pessoas e seus respectivos
endereços. O projeto foi desenvolvido como trabalho acadêmico com o objetivo
de demonstrar, de forma clara e didática, o uso de Docker, Docker Compose,
containers, networks, volumes, comunicação entre serviços via API REST e
persistência de dados.

Ao cadastrar uma pessoa, o usuário informa o CEP e a aplicação consulta
automaticamente a API pública [ViaCEP](https://viacep.com.br) para preencher
o endereço.

## 2. Arquitetura

```text
Frontend (HTML/CSS/JS + Nginx)
   ↓  HTTP / REST API (proxy /api/)
Backend (Flask)
   ↓  SQL
MySQL
   ↓
Docker Volume (mysql_data)
```

A aplicação é composta por 3 containers, todos conectados pela mesma Docker
Network (`cadastro_network`), criada automaticamente pelo Docker Compose:

* **frontend** — serve os arquivos estáticos (HTML/CSS/JS) através do Nginx
  e faz proxy reverso de `/api/` para o backend, evitando problemas de CORS
  entre containers.
* **backend** — API REST em Flask, responsável pelas regras de negócio e
  pela comunicação com o MySQL.
* **mysql** — banco de dados relacional, com dados persistidos em um Docker
  Volume.

O backend se conecta ao banco utilizando o nome do serviço (`mysql`), e não
`localhost`, pois cada container possui seu próprio localhost — a
comunicação entre containers só funciona através da rede criada pelo Docker
Compose, usando o nome do serviço como hostname.

## 3. Tecnologias

* Docker
* Docker Compose
* Python
* Flask
* MySQL
* HTML
* CSS
* JavaScript
* Nginx (para servir o frontend)

## 4. Como executar

```bash
git clone <repositorio>
cd docker-cadastro-pessoas
docker compose up --build
```

Opcionalmente, copie `.env.example` para `.env` para customizar as
credenciais do banco (os valores padrão já funcionam para demonstração):

```bash
cp .env.example .env
```

## 5. Como acessar

```text
http://localhost:8082
```

A API do backend também pode ser acessada diretamente em:

```text
http://localhost:5000
```

## 6. Como parar

```bash
docker compose down
```

**Importante:** não utilize `docker compose down -v` durante a demonstração
de persistência, pois a flag `-v` remove os volumes e apaga os dados
cadastrados.

## 7. Persistência

Os dados do MySQL são armazenados no Docker Volume `mysql_data`, montado em
`/var/lib/mysql` dentro do container do banco. Isso significa que, ao
executar `docker compose down` seguido de `docker compose up`, os registros
cadastrados continuam existindo — o volume não é removido junto com os
containers.

## 8. API

### `GET /health`

Verifica se o backend está funcionando.

Resposta:

```json
{
  "status": "ok"
}
```

### `POST /pessoas`

Cadastra uma pessoa.

Requisição:

```http
POST /pessoas
Content-Type: application/json
```

```json
{
  "nome": "Paulo Victor",
  "cpf": "12345678900",
  "cep": "60000000",
  "numero": "100",
  "complemento": "Apartamento 101",
  "logradouro": "Rua Exemplo",
  "bairro": "Centro",
  "localidade": "Fortaleza",
  "uf": "CE",
  "estado": "Ceará",
  "rua": "Rua Exemplo"
}
```

Resposta (201):

```json
{
  "message": "Pessoa cadastrada com sucesso"
}
```

Resposta (400 — campos obrigatórios ausentes):

```json
{
  "error": "Preencha os campos obrigatórios."
}
```

### `GET /pessoas`

Lista as pessoas cadastradas.

Resposta (200):

```json
[
  {
    "id": 1,
    "nome": "Paulo Victor",
    "cpf": "12345678900",
    "cep": "60000000",
    "numero": "100",
    "complemento": "Apartamento 101",
    "logradouro": "Rua Exemplo",
    "bairro": "Centro",
    "localidade": "Fortaleza",
    "uf": "CE",
    "estado": "Ceará",
    "rua": "Rua Exemplo",
    "created_at": "2026-09-15T10:00:00"
  }
]
```

Do navegador, o frontend consome esses endpoints através do caminho
`/api/pessoas`, que o Nginx encaminha para `http://backend:5000/pessoas`
dentro da rede Docker.

## 9. Estrutura de diretórios

```text
docker-cadastro-pessoas/
│
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── database/
    └── init.sql
```
