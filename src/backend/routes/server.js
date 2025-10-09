const express = require('express');
const cors = require('cors');
const db = require('../db');

const app = express();
app.use(cors());
app.use(express.json());

app.post("/usuarios", (req, res) => {
    const {  
        nome_usuario,
        email,
        senha_hash,
        cpf
    } = req.body; // pega as infos do body
    const sql = "INSERT INTO usuarios (nome_usuario, email, senha_hash, cpf) VALUES (?, ?, ?, ?)";

    db.query(sql, [nome_usuario, email, senha_hash, cpf], (err, results) => {  // query == insere os dados no bd
        if (err) {
            console.error("Erro ao inserir usuário:", err.sqlMessage || err);
            res.status(500).json({ erro: err.sqlMessage || "Erro ao salvar usuário no BD" });
        } else {
            res.json({  // opcional
                id_usuario: results.insertId,
                nome_usuario: nome_usuario,
                email: email,
                senha_hash: senha_hash,
                cpf: cpf
            });
        }
    });
});

app.listen(3000, () => {
    console.log("servidor rodando em http://localhost:3000")
});