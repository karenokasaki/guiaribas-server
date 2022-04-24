const express = require("express")
const router = express.Router()

const userModel = require("../models/User.model")
const itemModel = require("../models/Item.model.js")
const reviewModel = require("../models/Review.model.js")
const storeModel = require("../models/Store.model.js")

const isAuth = require("../middlewares/isAuth")
const attachCurrentUser = require("../middlewares/attachCurrentUser")
const bcrypt = require("bcrypt")
const generateToken = require("../config/jwt.config");
const saltRounds = 10

router.post('/create-user', async (req, res) => {
    try {
        const { password } = req.body;

        if (
            !password || password.length < 8
        ) {
            // retorna Bad Request
            return res.status(400).json({
                msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
            });
        }
        // geração de salts e password criptografada
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            ...req.body,
            passwordHash: hashedPassword,
        });
        // Deleta o password e a versão no retorno da atualização
        delete newUser._doc.passwordHash;
        delete newUser._doc.__v;

        // retorna success para criação de um novo usuário
        return res.status(201).json(newUser._doc);
    } catch (error) {
        // retorna Internal Server Error

        return res.status(450).json({ msg: error.message });
    }
});

// Rota de Login
router.post("/login", async (req, res) => {
    try {
        // extrai o email e password da requisição do usuário.
        const { email, password } = req.body;

        // pesquisa o usuário no banco pelo email
        const user = await userModel.findOne({ email });

        // Verificar se existe o usuário no nosso banco de dados.
        if (!user) {
            // Retorna Bad Request
            return res
                .status(400)
                .json({ msg: "This email is not yet registered in our website!" });
        }

        // Verificar se a senha digitada pelo usuário é igual ao do banco de dados
        if (await bcrypt.compare(password, user.passwordHash)) {
            // Geração do token de acesso
            const token = generateToken(user);

            // Retorna success a tentativa de login
            return res.status(200).json({
                user: {
                    name: user.name,
                    email: user.email,
                    _id: user._id,
                    role: user.role,
                },
                token,
            });
        } else {
            // Retorna unauthorized
            return res.status(401).json({ msg: "Wrong password or email" });
        }
    } catch (error) {
        // Retorna Internal Server Error
        return res.status(500).json({ msg: error.message });
    }
});

// Rota para buscar usuário
router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
    try {
        const loggedUser = req.currentUser;

        // Verificar se o usuário está logado
        if (loggedUser) {
            const populateUser = await userModel
                .findById(loggedUser._id)
            //populate user with favorite stores, items and comments
            //.populate(favorite)

            // Deleta o password e a versão no retorno da atualização
            delete populateUser._doc.passwordHash;
            delete populateUser._doc.__v;

            // Retorna success quando o usuário esta logado
            return res.status(200).json(populateUser);
        } else {
            // Retorna Not Found
            return res.status(404).json({ msg: "User not found." });
        }
    } catch (error) {
        // Retorna Internal Server Error
        return res.status(500).json({ msg: error.message });
    }
});

// Rota para um soft delete do usuário
// Verifica se o usuário esta logado, identifica o ID e "deleta" do banco de dados.
router.delete(
    "/profile/disable-account",
    isAuth,
    attachCurrentUser,
    async (req, res) => {
        try {
            const loggedUser = req.currentUser;

            const disableUser = await userModel.findOneAndUpdate(
                { _id: loggedUser._id },
                { userIsActive: false },
                { new: true }
            );

            // Deleta o password e a versão no retorno da atualização
            delete disableUser._doc.passwordHash;
            delete disableUser._doc.__v;

            return res.status(200).json(disableUser, "user disabled");
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
);

// Rota active account
router.patch(
    "/profile/active-account",
    isAuth,
    attachCurrentUser,
    async (req, res) => {
      try {
        const loggedUser = req.currentUser;
  
        const activeUser = await userModel.findOneAndUpdate(
          { _id: loggedUser._id },
          { userIsActive: true },
          { new: true, runValidators: true }
        );
  
        // Deleta o password e a versão no retorno da atualização
        delete activeUser._doc.passwordHash;
        delete activeUser._doc.__v;
  
        return res.status(200).json(activeUser);
      } catch (error) {
        return res.status(500).json({ msg: error.message });
      }
    }
  );


module.exports = router