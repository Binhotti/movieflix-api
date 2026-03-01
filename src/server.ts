import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '../generated/index.js';

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});

app.post('/movies', async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } =
        req.body;

    // case insentitive - se a busca for feita por john wick ou John wick ou JOHN WICK, o registro vai ser retornado na consulta

    // case sensitive - se a busca por john wick e no banco estiver como John Wick, não vai ser retornado na consulta

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: 'insensitive' } },
        });

        if (movieWithSameTitle) {
            return res.status(409).send({
                message: 'Já existe um filme cadastrado com esse título',
            });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        console.error('Erro ao cadastrar filme:', error);
        return res.status(500).send({ message: 'Falha ao cadastrar um filme' });
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
