const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();

// Connect to MySQL database from the server
const sequelize = new Sequelize('hotel', 'root', '', {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: '3307',
});

// Define a model
const User = sequelize.define('User', {
    nome: Sequelize.STRING,
    email: Sequelize.STRING,
    senha: Sequelize.STRING,
    token: Sequelize.STRING,
    cpf: Sequelize.STRING,
    dataNascimento: Sequelize.DATE
});

sequelize.sync({ alter: true });
// Sync the model with the database


// Middleware
app.use(express.json());

// Endpoints
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.get('/users/:userId', async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findOne({
        where: {
            id: userId
        }
    });
    res.json(user)
});

app.post('/users', async (req, res) => {
    const { nome, email, senha, token, cpf, dataNascimento } = req.body;
    const user = await User.create({ nome, email, senha, token, cpf, dataNascimento });
    res.json(user);
});

// PUT endpoint
app.put('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updatedUser = req.body;

    const result = await User.update(updatedUser, {
        where: {
            id: userId
        }
    });

    res.json({ message: 'Os dados foram atualizados com sucesso!', affectedRows: result[0] });
});

// DELETE endpoint
app.delete('/users/:userId', async (req, res) => {
    const userId = req.params.userId;

    const result = await User.destroy({
        where: {
            id: userId
        }
    });

    res.json({ message: 'O cadastro do cliente foi excluído com sucesso!.', affectedRows: result });
});


// Protection middleware
app.use((req, res, next) => {
    const token = req.headers.authorization;
    if (token !== 'secret-token') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});