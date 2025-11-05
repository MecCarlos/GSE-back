// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

// const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'votre_clef_secrete_super_safe';

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(session({
  secret: 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));


// Configuration de multer pour enregistrer les images dans /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où stocker les images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  },
});

// Initialiser multer
const upload = multer({ storage: storage });


// Configuration de la connexion MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'g_empire'
};

// Création du pool global unique
const pool = mysql.createPool(dbConfig);
console.log('Connexion à la base de données MySQL établie');

// === ROUTES ===


// Enregistrement
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(400).json({ message: "Email déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const statue = 1;
    await pool.execute('INSERT INTO users (name, email, password, statue) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, statue]);
    res.status(201).json({ message: "Utilisateur inscrit avec succès" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});


//connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Cas 1 : admin hardcodé
  if (email === 'root@gmail.com' && password === 'Mac-os02') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      token,
      role: 'admin',
      message: 'Admin connecté',
      user: { id: 0, nom: 'Super Admin', email } 
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrecte' });
    }

    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

    // renvoyer aussi les infos utiles de l'utilisateur
    res.json({
      token,
      role: 'user',
      message: 'Connexion réussie',
      user: {
        id: user.id,
        nom: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



const uploadProduit = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
}).fields([
  { name: 'image_principale', maxCount: 1 },
  { name: 'image_1', maxCount: 1 },
  { name: 'image_2', maxCount: 1 }
]);



//  Ajouter un produit avec variantes
app.post('/api/adm/add/produits', upload.any(), async (req, res) => {
  try {
    const { nom, categorie, description, variantes } = req.body;
    const parsedVariantes = JSON.parse(variantes);

    //  Insert produit
    const [prodResult] = await pool.execute(
      'INSERT INTO produits (nom, categorie, description) VALUES (?, ?, ?)',
      [nom, categorie, description]
    );

    const prodId = prodResult.insertId;

    //  Gérer les images pour chaque variante
    parsedVariantes.forEach((v, i) => {
      v.images = {};
      ['principale','image_1','image_2'].forEach(key => {
        const file = req.files.find(f => f.fieldname === `images_${i}_${key}`);
        v.images[key] = file ? file.filename : null; // si pas d'image -> null
      });

      // Assurer que prix/prix_promo ne soient pas undefined
      
      v.prix_promo = v.prix_promo ? v.prix_promo : null;
    });

    // Insert variantes
    for (const v of parsedVariantes) {
      const { options, quantite, prix, prix_promo, images } = v;
      await pool.execute(
        'INSERT INTO variantes (produit_id, options, quantite, prix, prix_promo, image_principale, image_1, image_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [prodId, JSON.stringify(options), quantite, prix, prix_promo, images.principale, images.image_1, images.image_2]
      );
    }

    res.json({ success: true, message: 'Produit ajouté avec variantes !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

//affichages des produit a l'admin
app.get("/api/adm/rec/produits", async (req, res) => {
  try {
    const [produits] = await pool.execute("SELECT * FROM produits");

    // Récupérer variantes pour chaque produit
    const produitsAvecVariantes = await Promise.all(
      produits.map(async (p) => {
        const [variantes] = await pool.execute(
          "SELECT * FROM variantes WHERE produit_id = ?",
          [p.id]
        );
        return {
          ...p,
          variantes: variantes.map(v => ({
            ...v,
            images: {
              principale: v.image_principale,
              image_1: v.image_1,
              image_2: v.image_2
            }
          }))
        };
      })
    );

    res.status(200).json(produitsAvecVariantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//supprimer un produit
app.delete('/api/adm/supprimer-produit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute("DELETE FROM produits WHERE id = ?", [id]);
    // await pool.execute("DELETE FROM variances WHERE produit_id = ?", [id]);
    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Modifier un produit
app.put('/api/adm/update-produit/:id', upload.any(), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { nom, categorie, description } = req.body;

    await conn.beginTransaction();

    // 1) Update infos générales
    await conn.execute(
      `UPDATE produits SET nom = ?, categorie = ?, description = ? WHERE id = ?`,
      [nom ?? null, categorie ?? null, description ?? null, id]
    );

    // 2) Reconstruire variantes
    let variantes = [];
    if (req.body.variantes) {
      variantes = typeof req.body.variantes === 'string' ? JSON.parse(req.body.variantes) : req.body.variantes;
    } else {
      const temp = {};
      Object.keys(req.body).forEach((k) => {
        const m = k.match(/^variantes\[(\d+)\]\[(.+)\]$/);
        if (m) {
          const idx = m[1];
          const field = m[2];
          temp[idx] = temp[idx] || {};
          temp[idx][field] = req.body[k];
        }
      });
      variantes = Object.keys(temp).sort((a, b) => Number(a) - Number(b)).map(i => temp[i]);
    }

    // Helper pour récupérer fichier uploadé
    const getUploadedFilename = (i, key) => {
      const candidates = [`variantes[${i}][images][${key}]`, `images_${i}_${key}`, `variantes_${i}_${key}`];
      const f = (req.files || []).find(file => candidates.includes(file.fieldname));
      return f ? f.filename : null;
    };

    // 3) Fusionner images existantes et uploads
    variantes = variantes.map((v, idx) => {
      const result = { ...v };

      // Parser options si string
      if (typeof result.options === 'string') {
        try { result.options = JSON.parse(result.options); } catch(e){}
      }

      // Types numériques
      result.quantite = result.quantite !== undefined && result.quantite !== '' ? Number(result.quantite) : null;
      result.prix = result.prix !== undefined && result.prix !== '' ? Number(result.prix) : null;
      result.prix_promo = result.prix_promo !== undefined && result.prix_promo !== '' ? Number(result.prix_promo) : null;

      // Images : fusion existant + upload
      result.images = result.images || {};
      ['principale', 'image_1', 'image_2'].forEach((key) => {
        // si nouveau fichier uploadé -> remplacer
        const uploadFile = getUploadedFilename(idx, key);
        if (uploadFile) result.images[key] = uploadFile;
        else if (result.images[key] === undefined || result.images[key] === null) result.images[key] = null;
        // sinon garder l'ancien nom (string)
      });

      return result;
    });

    // 4) Update/Insert variantes
    for (const v of variantes) {
      const optionsJSON = v.options ? JSON.stringify(v.options) : JSON.stringify({});
      if (v.id) {
        // update existant
        await conn.execute(
          `UPDATE variantes
           SET options = ?, quantite = ?, prix = ?, prix_promo = ?, image_principale = ?, image_1 = ?, image_2 = ?
           WHERE id = ? AND produit_id = ?`,
          [
            optionsJSON,
            v.quantite ?? null,
            v.prix ?? null,
            v.prix_promo ?? null,
            v.images.principale ?? null,
            v.images.image_1 ?? null,
            v.images.image_2 ?? null,
            v.id,
            id
          ]
        );
      } else {
        // nouvelle variante
        await conn.execute(
          `INSERT INTO variantes (produit_id, options, quantite, prix, prix_promo, image_principale, image_1, image_2)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            optionsJSON,
            v.quantite ?? 0,
            v.prix ?? null,
            v.prix_promo ?? null,
            v.images.principale ?? null,
            v.images.image_1 ?? null,
            v.images.image_2 ?? null
          ]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Produit et variantes mis à jour' });

  } catch (err) {
    try { await conn.rollback(); } catch(e){}
    console.error('Erreur update produit :', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    try { conn.release(); } catch(e){}
  }
});

//affichages des produit a l'accueil
app.get("/api/rec/produits", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM produits");
    res.status(200).json(rows); 
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//Enregitrement des commanders
app.post("/api/commande/create", async (req, res) => {
  try {
     console.log("Données reçues du front :", req.body);

    const { userId, adresseLivraison, paiement, cardData, items, total } = req.body;

    // Validation minimale
    if (!userId || !adresseLivraison || !paiement || !items || !total) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    let cardInfo = null;

    // Si paiement par carte
    if (paiement === "carte") {
      if (!cardData || !cardData.numero || !cardData.date || !cardData.cvc) {
        return res.status(400).json({ message: "Informations de carte manquantes" });
      }

      // Ne jamais stocker le CVC ou le code complet
      cardInfo = {
        numero: cardData.numero.replace(/\d{12}(\d{4})$/, "**** **** **** $1"), // masque tout sauf les 4 derniers
        dateExp: cardData.date
      };
    }

    // Insérer la commande dans la base
    const [result] = await pool.query(
      `INSERT INTO commandes (userId, adresseLivraison, paiement, cardData, items, total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(adresseLivraison),
        paiement,
        cardInfo ? JSON.stringify(cardInfo) : null,
        JSON.stringify(items),
        total
      ]
    );

    return res.status(201).json({
      message: "Commande enregistrée avec succès",
      commandeId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
}


//Afficher les commandes 
app.get("/api/commandes/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [rows] = await pool.query(
      "SELECT id, adresseLivraison, paiement, items, total, etat, createdAt FROM commandes WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Route admin pour récupérer toutes les commandes
app.get("/api/admin/get-commandes", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.id, c.etat, c.total, c.adresseLivraison, c.paiement, c.items, c.createdAt,
             u.name AS client_nom, u.email AS client_email
      FROM commandes c
      JOIN users u ON c.userId = u.id
      ORDER BY c.createdAt DESC
    `);

    const commandes = rows.map(c => {
      let adresse = {};
      let produits = [];

      // Parser l'adresse
      try {
        if (typeof c.adresseLivraison === "string") {
          adresse = JSON.parse(c.adresseLivraison);
        } else {
          adresse = c.adresseLivraison || {};
        }
      } catch (e) {
        console.error("Erreur JSON adresseLivraison", c.id, c.adresseLivraison);
      }

      // Parser les items avec fix quotes et clés
      try {
        if (typeof c.items === "string") {
          let rawItems = c.items
            .replace(/'/g, '"')                   // Remplace ' par "
            .replace(/([a-zA-Z0-9_]+):/g, '"$1":'); // Ajoute " autour des clés non-quotées
          produits = JSON.parse(rawItems || "[]");
        } else {
          produits = c.items || [];
        }
      } catch (e) {
        console.error("Erreur JSON items", c.id, c.items);
        produits = [];
      }

      return {
        id: c.id,
        etat: c.etat,
        total: c.total,
        adresseLivraison: adresse,
        paiement: c.paiement,
        createdAt: c.createdAt,
        client: { nom: c.client_nom, email: c.client_email },
        items: produits
      };
    });

    res.json(commandes);

  } catch (err) {
    console.error("Erreur récupération commandes admin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Route pour mettre à jour l'état d'une commande
app.put("/api/commandes/:id", async (req, res) => {
  const { id } = req.params;
  const { etat } = req.body;

  // Vérifier que l'état est valide
  const etatsValides = ["en_attente", "validée", "en_livraison", "livrée", "annulée"];
  if (!etatsValides.includes(etat)) {
    return res.status(400).json({ success: false, message: "État invalide." });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Vérifier si la commande existe
    const [rows] = await connection.execute("SELECT * FROM commandes WHERE id = ?", [id]);
    if (rows.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, message: "Commande non trouvée." });
    }

    // Mettre à jour l'état
    await connection.execute("UPDATE commandes SET etat = ? WHERE id = ?", [etat, id]);

    // Récupérer la commande mise à jour
    const [updatedRows] = await connection.execute("SELECT * FROM commandes WHERE id = ?", [id]);

    await connection.end();
    res.json({ success: true, commande: updatedRows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});








// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
