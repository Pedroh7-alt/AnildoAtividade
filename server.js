const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  const origem = req.get('Origin');
  if (origem && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

let produtos = [
  { id: 1, nome: 'Caderno', preco: 15.9, quantidade: 40 },
  { id: 2, nome: 'Caneta azul', preco: 2.5, quantidade: 200 },
  { id: 3, nome: 'Mochila', preco: 129.9, quantidade: 12 },
];
let proximoId = 4;

function validarProduto({ nome, preco, quantidade }, parcial = false) {
  if (!parcial || nome !== undefined) {
    if (typeof nome !== 'string' || nome.trim() === '') {
      return 'O campo "nome" é obrigatório e deve ser um texto.';
    }
  }
  if (!parcial || preco !== undefined) {
    if (typeof preco !== 'number' || Number.isNaN(preco) || preco < 0) {
      return 'O campo "preco" é obrigatório e deve ser um número maior ou igual a 0.';
    }
  }
  if (!parcial || quantidade !== undefined) {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      return 'O campo "quantidade" é obrigatório e deve ser um inteiro maior ou igual a 0.';
    }
  }
  return null;
}

app.get('/produtos', (req, res) => {
  res.status(200).json(produtos);
});

app.post('/produtos', (req, res) => {
  const erro = validarProduto(req.body || {});
  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, preco, quantidade } = req.body;
  const novoProduto = { id: proximoId++, nome: nome.trim(), preco, quantidade };
  produtos.push(novoProduto);

  res.status(201).json(novoProduto);
});

app.put('/produtos/:id', (req, res) => {
  const id = Number(req.params.id);
  const produto = produtos.find((p) => p.id === id);

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  const erro = validarProduto(req.body || {}, true);
  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, preco, quantidade } = req.body;
  if (nome !== undefined) produto.nome = nome.trim();
  if (preco !== undefined) produto.preco = preco;
  if (quantidade !== undefined) produto.quantidade = quantidade;

  res.status(200).json(produto);
});

app.delete('/produtos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = produtos.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  const [removido] = produtos.splice(indice, 1);
  res.status(200).json({ mensagem: 'Produto excluído com sucesso.', produto: removido });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});