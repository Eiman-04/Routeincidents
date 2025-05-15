const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = './db.json';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Endpoint PUT pour mettre à jour le statut d'un incident
app.put('/incidents/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Statut manquant' });
  }

  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de lecture des incidents' });
    }

    let incidents = [];
    try {
      incidents = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ error: 'Fichier JSON corrompu' });
    }

    const incidentIndex = incidents.findIndex(incident => incident.id === id);
    if (incidentIndex === -1) {
      return res.status(404).json({ error: 'Incident non trouvé' });
    }

    incidents[incidentIndex].status = status;

    fs.writeFile(path, JSON.stringify(incidents, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur d\'écriture' });
      }
      res.status(200).json(incidents[incidentIndex]);
    });
  });
});

// Endpoint POST pour signaler un incident
app.post('/incidents', (req, res) => {
  const { description, latitude, longitude, date } = req.body;

  if (!description || !latitude || !longitude || !date) {
    return res.status(400).json({ error: 'Données manquantes : description, latitude, longitude et date sont nécessaires' });
  }

  const newIncident = {
    id: Date.now(),
    description,
    latitude,
    longitude,
    date,
  };

  fs.readFile(path, 'utf8', (err, data) => {
    let incidents = [];
    if (!err && data) {
      try {
        incidents = JSON.parse(data);
      } catch (err) {
        incidents = [];
      }
    }

    incidents.push(newIncident);

    fs.writeFile(path, JSON.stringify(incidents, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur d\'écriture dans le fichier' });
      }
      res.status(201).json(newIncident);
    });
  });
});

// ✅ Endpoint DELETE pour supprimer un incident
app.delete('/incidents/:id', (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de lecture des incidents' });
    }

    let incidents = [];
    try {
      incidents = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ error: 'Fichier JSON corrompu' });
    }

    const newIncidents = incidents.filter(incident => incident.id !== id);

    if (newIncidents.length === incidents.length) {
      return res.status(404).json({ error: 'Incident non trouvé' });
    }

    fs.writeFile(path, JSON.stringify(newIncidents, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur d\'écriture' });
      }

      res.status(200).json({ message: 'Incident supprimé' });
    });
  });
});

// Endpoint GET pour récupérer tous les incidents
app.get('/incidents', (req, res) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    try {
      const incidents = JSON.parse(data);
      res.json(incidents);
    } catch (err) {
      res.status(500).json({ error: 'Erreur de lecture des incidents' });
    }
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
