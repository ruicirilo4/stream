import express from 'express';
import torrentStream from 'torrent-stream';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send(`
    <html>
    <body>
      <h1>Bem-vindo à aplicação de streaming de filmes via torrent!</h1>
      <form method="get" action="/stream">
        <label for="torrent">Insira o magnet link:</label><br>
        <input type="text" name="torrent" id="torrent" required><br>
        <button type="submit">Iniciar Streaming</button>
      </form>
    </body>
    </html>
  `);
});

app.get('/stream', (req, res) => {
  const magnetLink = req.query.torrent;

  if (!magnetLink) {
    res.send('Magnet link não especificado.');
    return;
  }

  const engine = torrentStream(magnetLink);
  let title = 'Título não disponível';

  engine.on('ready', () => {
    const file = engine.files[0];

    if (!file) {
      res.send('Nenhum arquivo encontrado no torrent.');
      return;
    }

    title = engine.torrent.name;

    res.setHeader('Content-Type', 'video/mp4');

    const videoStream = file.createReadStream();

    videoStream.pipe(res);
  });

  engine.on('error', (err) => {
    console.error('Erro no torrent:', err);
    res.status(500).send('Erro ao processar o torrent.');
  });

  engine.on('wire', () => {
    // Comente ou remova as seguintes linhas para evitar a saída no console
    /*
    const numSeeders = engine.swarm.wires.reduce((count, wire) => {
      return wire.peerInterested ? count + 1 : count;
    }, 0);
    const numPeers = engine.swarm.wires.length;

    console.log(`Título do Torrent: ${title}`);
    console.log(`Número de Seeders: ${numSeeders}`);
    console.log(`Número de Peers: ${numPeers}`);
    */
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
