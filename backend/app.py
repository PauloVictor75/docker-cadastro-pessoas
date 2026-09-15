import os
import time

import mysql.connector
from flask import Flask, jsonify, request

app = Flask(__name__)

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "mysql"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "database": os.environ.get("DB_NAME", "cadastro"),
    "user": os.environ.get("DB_USER", "cadastro_user"),
    "password": os.environ.get("DB_PASSWORD", "cadastro_pass"),
}

CAMPOS_OBRIGATORIOS = ["nome", "cpf", "cep", "numero"]

CAMPOS_PESSOA = [
    "nome",
    "cpf",
    "cep",
    "numero",
    "complemento",
    "logradouro",
    "bairro",
    "localidade",
    "uf",
    "estado",
    "rua",
]


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def aguardar_banco(tentativas=10, intervalo_segundos=3):
    """Espera o MySQL ficar pronto antes do Flask começar a atender requisições."""
    for tentativa in range(1, tentativas + 1):
        try:
            conexao = get_db_connection()
            conexao.close()
            return
        except mysql.connector.Error:
            print(f"Aguardando MySQL... tentativa {tentativa}/{tentativas}")
            time.sleep(intervalo_segundos)
    raise RuntimeError("Não foi possível conectar ao MySQL.")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/pessoas", methods=["POST"])
def cadastrar_pessoa():
    dados = request.get_json(silent=True) or {}

    campos_faltando = [campo for campo in CAMPOS_OBRIGATORIOS if not dados.get(campo)]
    if campos_faltando:
        return jsonify({"error": "Preencha os campos obrigatórios."}), 400

    valores = tuple(dados.get(campo, "") for campo in CAMPOS_PESSOA)

    try:
        conexao = get_db_connection()
        cursor = conexao.cursor()
        cursor.execute(
            """
            INSERT INTO pessoas
                (nome, cpf, cep, numero, complemento, logradouro, bairro, localidade, uf, estado, rua)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            valores,
        )
        conexao.commit()
        cursor.close()
        conexao.close()
    except mysql.connector.Error:
        return jsonify({"error": "Erro ao cadastrar pessoa."}), 500

    return jsonify({"message": "Pessoa cadastrada com sucesso"}), 201


@app.route("/pessoas", methods=["GET"])
def listar_pessoas():
    try:
        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, nome, cpf, cep, numero, complemento, logradouro,
                   bairro, localidade, uf, estado, rua, created_at
            FROM pessoas
            ORDER BY id DESC
            """
        )
        pessoas = cursor.fetchall()
        cursor.close()
        conexao.close()
    except mysql.connector.Error:
        return jsonify({"error": "Não foi possível carregar a lista de pessoas."}), 500

    for pessoa in pessoas:
        if pessoa.get("created_at") is not None:
            pessoa["created_at"] = pessoa["created_at"].isoformat()

    return jsonify(pessoas), 200


if __name__ == "__main__":
    aguardar_banco()
    app.run(host="0.0.0.0", port=5000)
