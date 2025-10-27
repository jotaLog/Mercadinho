const express = require('express');
const cors = require('cors');
const db = require('../db');
const bcrypt = require('bcrypt');
// const multer = require('multer');
// const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
// })
// const upload = multer({ storage: storage });

// app.use(express.static('public'));
// app.use('/uploads', express.static('uploads'));

// upload de imagem ==================================================================================================================

// app.post('/upload', upload.single('arquivo'), (req, res) => {
//     const {originalname, filename} = req.file;

//     const sql = "INSERT INTO imagens (nome_original, nome_arquivo) VALUES (?, ?)";
//     db.query(sql, [originalname, filename], (err, results) => {
//         if (err) {
//             console.error("Erro ao inserir imagem:", err.sqlMessage || err);
//             res.status(500).json({ erro: err.sqlMessage || "Erro ao salvar imagem no BD" });
//         } else {
//             res.json({ mensagem: 'upload realizado com sucesso' });
//         }
//     });
// });

// app.get('/imagens', (req, res) => {
//     const sql = "SELECT * FROM imagens ORDER BY id_imagem DESC";
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Erro ao buscar imagens:", err.sqlMessage || err);
//             res.status(500).json({ erro: err.sqlMessage || "Erro ao buscar imagens no BD" });
//         } else {
//             res.json(results);
//         }
//     });
// });

// Rota para criar um novo usuário =============================================================================================================

// Cadastro ====================================================================================================================================

app.post("/usuarios", (req, res) => {
    const { nome_user, email, senha, tipo_user } = req.body;

    if (!nome_user || !email || !senha) {
        return res.status(400).json({ erro: "Preencha nome, email e senha." });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("Erro ao verificar email:", err);
            return res.status(500).json({ erro: "Erro ao verificar usuário." });
        }

        if (results.length > 0) {
            return res.status(400).json({ erro: "E-mail já cadastrado." });
        }

        bcrypt.hash(senha, 10, (err, senha_hash) => {
            if (err) {
                console.error("Erro ao criptografar senha:", err);
                return res.status(500).json({ erro: "Erro ao processar senha." });
            }

            const sql = "INSERT INTO usuarios (nome_user, email, senha, tipo_user) VALUES (?, ?, ?, ?)";
            db.query(sql, [nome_user, email, senha_hash, tipo_user || "cliente"], (err, result) => {
                if (err) {
                    console.error("Erro ao inserir usuário:", err);
                    return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
                }

                res.status(201).json({
                    mensagem: "Usuário cadastrado com sucesso!",
                    id_user: result.insertId,
                    nome_user,
                    email,
                    tipo_user: tipo_user || "cliente"
                });
            });
        });
    });
});

// Login =======================================================================================================================================

app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("Erro ao buscar usuário:", err);
            return res.status(500).json({ erro: "Erro ao buscar usuário." });
        }

        if (results.length === 0) {
            return res.status(401).json({ erro: "Usuário não encontrado." });
        }

        const usuario = results[0];

        bcrypt.compare(senha, usuario.senha, (err, senhaValida) => {
            if (err) {
                console.error("Erro ao comparar senha:", err);
                return res.status(500).json({ erro: "Erro ao verificar senha." });
            }

            if (!senhaValida) {
                return res.status(401).json({ erro: "Senha incorreta." });
            }

            res.json({
                mensagem: "Login realizado com sucesso!",
                usuario: {
                    id_user: usuario.id_user,
                    nome_user: usuario.nome_user,
                    email: usuario.email,
                    tipo_user: usuario.tipo_user
                }
            });
        });
    });
});

// =============================================================================================================================================

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});