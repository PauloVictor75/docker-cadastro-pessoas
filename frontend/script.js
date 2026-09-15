const API_BASE = "/api";

const UF_PARA_ESTADO = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

const form = document.getElementById("form-cadastro");
const mensagemEl = document.getElementById("mensagem");
const tabelaCorpo = document.getElementById("tabela-pessoas-corpo");

function mostrarMensagem(texto, tipo) {
  mensagemEl.textContent = texto;
  mensagemEl.className = `mensagem ${tipo}`;
  mensagemEl.hidden = false;
}

function esconderMensagem() {
  mensagemEl.hidden = true;
}

async function buscarCep() {
  const cepInput = document.getElementById("cep");
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    mostrarMensagem("Informe um CEP válido com 8 dígitos.", "erro");
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      mostrarMensagem("CEP não encontrado.", "erro");
      return;
    }

    document.getElementById("logradouro").value = dados.logradouro || "";
    document.getElementById("bairro").value = dados.bairro || "";
    document.getElementById("localidade").value = dados.localidade || "";
    document.getElementById("uf").value = dados.uf || "";
    esconderMensagem();
  } catch (erro) {
    mostrarMensagem("Não foi possível consultar o CEP.", "erro");
  }
}

async function cadastrarPessoa(evento) {
  evento.preventDefault();

  const uf = document.getElementById("uf").value.toUpperCase();
  const logradouro = document.getElementById("logradouro").value;

  const payload = {
    nome: document.getElementById("nome").value.trim(),
    cpf: document.getElementById("cpf").value.trim(),
    cep: document.getElementById("cep").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    complemento: document.getElementById("complemento").value.trim(),
    logradouro: logradouro,
    bairro: document.getElementById("bairro").value.trim(),
    localidade: document.getElementById("localidade").value.trim(),
    uf: uf,
    estado: UF_PARA_ESTADO[uf] || "",
    rua: logradouro,
  };

  if (!payload.nome || !payload.cpf || !payload.cep || !payload.numero) {
    mostrarMensagem("Preencha os campos obrigatórios.", "erro");
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/pessoas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      mostrarMensagem("Erro ao cadastrar pessoa.", "erro");
      return;
    }

    mostrarMensagem("Pessoa cadastrada com sucesso.", "sucesso");
    form.reset();
    carregarPessoas();
  } catch (erro) {
    mostrarMensagem("Erro ao cadastrar pessoa.", "erro");
  }
}

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto || "";
  return celula;
}

async function carregarPessoas() {
  try {
    const resposta = await fetch(`${API_BASE}/pessoas`);

    if (!resposta.ok) {
      mostrarMensagem("Não foi possível carregar a lista de pessoas.", "erro");
      return;
    }

    const pessoas = await resposta.json();
    tabelaCorpo.innerHTML = "";

    for (const pessoa of pessoas) {
      const linha = document.createElement("tr");
      linha.appendChild(criarCelula(pessoa.nome));
      linha.appendChild(criarCelula(pessoa.cpf));
      linha.appendChild(criarCelula(pessoa.localidade));
      linha.appendChild(criarCelula(pessoa.uf));
      tabelaCorpo.appendChild(linha);
    }
  } catch (erro) {
    mostrarMensagem("Não foi possível carregar a lista de pessoas.", "erro");
  }
}

document.getElementById("btn-buscar-cep").addEventListener("click", buscarCep);
form.addEventListener("submit", cadastrarPessoa);

carregarPessoas();
