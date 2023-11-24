const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');

const app = express();

// Connect to MySQL database from the server
const sequelize = new Sequelize('hotel', 'root', 'admin', {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: '3306',
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

const Reserva = sequelize.define('Reserva', {
    apartamento: Sequelize.STRING,
    numHospedes: Sequelize.INTEGER,
    dataEntrada: Sequelize.DATE,
    dataSaida: Sequelize.DATE
});

sequelize.sync({ alter: true });

// Middleware
app.use(cors())
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

app.get('/reservas', async (req, res) => {
    const reservas = await Reserva.findAll();
    res.json(reservas);
});

app.post('/users', async (req, res) => {
    const { nome, email, senha, token, cpf, dataNascimento } = req.body;
    const user = await User.create({ nome, email, senha, token, cpf, dataNascimento });
    res.json(user);
});

app.post('/reservas', async (req, res) => {
    const { apartamento, numHospedes, dataEntrada, dataSaida } = req.body;

    // Valide os campos, se necessário
    if (!apartamento || !numHospedes || !dataEntrada || !dataSaida) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Crie a reserva
    const reserva = await Reserva.create({ apartamento, numHospedes, dataEntrada, dataSaida });

    res.status(201).json({ message: 'Reserva criada com sucesso!', reserva });
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const user = await User.findOne({
            where: {
                email,
                senha
            }
        });

        if (user) {
            // Usuário encontrado, retorna um token ou uma resposta de sucesso
            res.status(200).json({ message: 'Login bem-sucedido' });
        } else {
            // Usuário não encontrado, retorna uma resposta de erro
            res.status(401).json({ message: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
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

// PUT endpoint para atualizar uma reserva específica
app.put('/reservas/:reservaId', async (req, res) => {
    const reservaId = req.params.reservaId;
    const updatedReserva = req.body;

    try {
        // Tenta encontrar a reserva pelo ID
        const reserva = await Reserva.findByPk(reservaId);

        // Se a reserva não for encontrada, retorne um erro 404
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada.' });
        }

        // Atualiza os dados da reserva
        await Reserva.update(updatedReserva, {
            where: {
                id: reservaId
            }
        });

        res.json({ message: 'Os dados da reserva foram atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar a reserva:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar a reserva.' });
    }
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

app.delete('/reservas/:reservaId', async (req, res) => {
    const reservaId = req.params.reservaId;

    try {
        // Tenta encontrar a reserva pelo ID
        const reserva = await Reserva.findByPk(reservaId);

        // Se a reserva não for encontrada, retorne um erro 404
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada.' });
        }

        // Exclui a reserva
        await Reserva.destroy({
            where: {
                id: reservaId
            }
        });

        res.json({ message: 'A reserva foi excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir a reserva:', error);
        res.status(500).json({ message: 'Erro interno ao excluir a reserva.' });
    }
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