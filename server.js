// // server.js
// require("dotenv").config();
// const express = require("express");
// const mysql = require("mysql2/promise");
// const multer = require("multer");
// const path = require("path");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const session = require("express-session");
// const bodyParser = require("body-parser");

// const app = express();
// const PORT = process.env.PORT || 3001;
// const JWT_SECRET = "votre_clef_secrete_super_safe";

// // Configuration de l'URL de base
// const BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "https://votre-domaine.com"
//     : `http://localhost:${PORT}`;

// // Middlewares
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static("uploads"));

// app.use(
//   cors({
//     origin: [
//       "https://gse-front.vercel.app",
//       "http://localhost:3000",
//       "http://localhost:3001",
//       "http://localhost:3002",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(
//   session({
//     secret: "session_secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false },
//   })
// );

// // Configuration de multer pour enregistrer les images dans /uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
// });

// // Configuration de la connexion MySQL (options valides)
// // const dbConfig = {
// //   host: 'localhost',
// //   user: 'root',
// //   password: '',
// //   database: 'g_empire',
// //   // connectionLimit: 10,
// //   // acquireTimeout: 60000,
// //   // timeout: 60000,
// //   // connectTimeout: 60000,
// //   reconnect: true
// // };


// const dbConfig = {
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT, 10),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// };

// const pool = mysql.createPool(dbConfig);




// // Middleware de vérification du token
// function verifyToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.status(401).json({ message: "Token manquant" });

//   const token = authHeader.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Token manquant" });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Token invalide" });
//   }
// }

// // Middleware de validation pour le contact
// const validateContact = (req, res, next) => {
//   const { nom, email, objet, message } = req.body;

//   if (!nom || !email || !objet || !message) {
//     return res.status(400).json({
//       success: false,
//       message: "Tous les champs sont obligatoires",
//     });
//   }

//   if (!/\S+@\S+\.\S+/.test(email)) {
//     return res.status(400).json({
//       success: false,
//       message: "Format d'email invalide",
//     });
//   }

//   if (message.length > 2000) {
//     return res.status(400).json({
//       success: false,
//       message: "Le message ne peut pas dépasser 2000 caractères",
//     });
//   }

//   next();
// };

// // === ROUTES AUTHENTIFICATION ===

// // Enregistrement
// app.post("/api/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
//       email,
//     ]);
//     if (rows.length > 0)
//       return res.status(400).json({ message: "Email déjà utilisé." });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const statue = 1;
//     await pool.execute(
//       "INSERT INTO users (name, email, password, statue) VALUES (?, ?, ?, ?)",
//       [name, email, hashedPassword, statue]
//     );
//     res.status(201).json({ message: "Utilisateur inscrit avec succès" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Erreur lors de l'inscription" });
//   }
// });

// // Connexion
// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;

//   // Cas 1 : admin hardcodé
//   if (
//     (email === "root@gmail.com" && password === "Mac-os002") ||
//     password === "gildas2006@"
//   ) {
//     const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, {
//       expiresIn: "1h",
//     });
//     return res.json({
//       token,
//       role: "admin",
//       message: "Admin connecté",
//       user: { id: 0, nom: "Super Admin", email },
//     });
//   }

//   try {
//     const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
//       email,
//     ]);
//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Utilisateur non trouvé" });
//     }

//     const user = rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ message: "Email ou mot de passe incorrecte" });
//     }

//     const token = jwt.sign({ id: user.id, role: "user" }, JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({
//       token,
//       role: "user",
//       message: "Connexion réussie",
//       user: {
//         id: user.id,
//         nom: user.name,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // === ROUTES CONTACT ===

// // GET - Récupérer seulement le compteur des messages non lus
// app.get("/api/admin/contacts/unread-count", verifyToken, async (req, res) => {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const [rows] = await conn.execute('SELECT COUNT(*) as count FROM contacts WHERE lu = FALSE');
    
//     res.json({
//       success: true,
//       count: rows[0].count
//     });
//   } catch (error) {
//     console.error("Erreur récupération compteur messages non lus:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la récupération du compteur",
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// // POST - Enregistrer un nouveau message de contact
// app.post("/api/contact", validateContact, async (req, res) => {
//   let conn;
//   try {
//     const { nom, email, objet, message } = req.body;

//     const ip = req.ip || req.connection.remoteAddress;
//     const userAgent = req.get("User-Agent") || "Inconnu";

//     conn = await pool.getConnection();

//     const [result] = await conn.execute(
//       `INSERT INTO contacts (nom, email, objet, message, ip, user_agent) 
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [nom, email, objet, message, ip, userAgent]
//     );

//     res.status(201).json({
//       success: true,
//       message:
//         "Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
//       data: {
//         id: result.insertId,
//         nom,
//         email,
//         objet,
//         date_envoi: new Date(),
//       },
//     });
//   } catch (error) {
//     console.error("Erreur enregistrement contact:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de l'envoi du message. Veuillez réessayer.",
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// // GET - Récupérer tous les contacts (pour l'admin) - VERSION AVEC CONCATENATION SECURISEE
// app.get("/api/admin/contacts", verifyToken, async (req, res) => {
//   let conn;
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;
    
//     console.log(" Requête contacts reçue:", { page, limit, search });

//     conn = await pool.getConnection();

//     // Validation et conversion
//     const pageNum = Math.max(1, parseInt(page));
//     const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Max 100 par page
//     const offset = (pageNum - 1) * limitNum;

//     let baseQuery = `SELECT * FROM contacts`;
//     let countQuery = `SELECT COUNT(*) as total FROM contacts`;
//     const params = [];

//     if (search && search.trim() !== "") {
//       const searchCondition = ` WHERE nom LIKE ? OR email LIKE ? OR objet LIKE ?`;
//       baseQuery += searchCondition;
//       countQuery += searchCondition;
//       const searchParam = `%${search}%`;
//       params.push(searchParam, searchParam, searchParam);
//     }

//     // Query finale avec LIMIT concaténé (sécurisé car on a validé les nombres)
//     const finalQuery = `${baseQuery} ORDER BY date_envoi DESC LIMIT ${limitNum} OFFSET ${offset}`;

//     console.log(" Exécution queries:", { countQuery, finalQuery });

//     // Compter le total
//     const [countRows] = await conn.execute(countQuery, params);
//     const total = countRows[0].total;

//     // Récupérer les données
//     const [contacts] = await conn.execute(finalQuery, params);

//     res.json({
//       success: true,
//       data: contacts,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum),
//       },
//     });

//   } catch (error) {
//     console.error(" Erreur récupération contacts:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la récupération des contacts",
//       error: error.message
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// // GET - Récupérer un contact spécifique
// app.get("/api/admin/contacts/:id", verifyToken, async (req, res) => {
//   let conn;
//   try {
//     const { id } = req.params;

//     conn = await pool.getConnection();
//     const [contacts] = await conn.execute(
//       "SELECT * FROM contacts WHERE id = ?",
//       [id]
//     );

//     if (contacts.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Contact non trouvé",
//       });
//     }

//     res.json({
//       success: true,
//       data: contacts[0],
//     });
//   } catch (error) {
//     console.error("Erreur récupération contact:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la récupération du contact",
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// // PUT - Marquer un message comme lu
// app.put("/api/admin/contacts/:id/read", verifyToken, async (req, res) => {
//   let conn;
//   try {
//     const { id } = req.params;

//     conn = await pool.getConnection();

//     const [result] = await conn.execute(
//       "UPDATE contacts SET lu = TRUE, date_lecture = NOW() WHERE id = ?",
//       [id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Contact non trouvé",
//       });
//     }

//     const [contacts] = await conn.execute(
//       "SELECT * FROM contacts WHERE id = ?",
//       [id]
//     );

//     res.json({
//       success: true,
//       message: "Message marqué comme lu",
//       data: contacts[0],
//     });
//   } catch (error) {
//     console.error("Erreur mise à jour contact:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la mise à jour du contact",
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// // GET - Statistiques des contacts
// app.get("/api/admin/contacts-stats", verifyToken, async (req, res) => {
//   let conn;
//   try {
//     conn = await pool.getConnection();

//     const [totalResult] = await conn.execute(
//       "SELECT COUNT(*) as total FROM contacts"
//     );
//     const [nonLusResult] = await conn.execute(
//       "SELECT COUNT(*) as non_lus FROM contacts WHERE lu = FALSE"
//     );
//     const [todayResult] = await conn.execute(
//       "SELECT COUNT(*) as aujourdhui FROM contacts WHERE DATE(date_envoi) = CURDATE()"
//     );
//     const [weekResult] = await conn.execute(
//       "SELECT COUNT(*) as cette_semaine FROM contacts WHERE YEARWEEK(date_envoi) = YEARWEEK(CURDATE())"
//     );

//     res.json({
//       success: true,
//       data: {
//         total: totalResult[0].total,
//         non_lus: nonLusResult[0].non_lus,
//         aujourdhui: todayResult[0].aujourdhui,
//         cette_semaine: weekResult[0].cette_semaine,
//       },
//     });
//   } catch (error) {
//     console.error("Erreur statistiques contacts:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la récupération des statistiques",
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// // Delete
// app.delete("/api/admin/contacts/:id", verifyToken, async (req, res) => {
//   let conn;
//   try {
//     const { id } = req.params;

//     conn = await pool.getConnection();

//     const [result] = await conn.execute(
//       "DELETE FROM contacts WHERE id = ?",
//       [id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Contact non trouvé",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Message supprimé avec succès",
//     });
//   } catch (error) {
//     console.error("Erreur suppression contact:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la suppression du message",
//     });
//   } finally {
//     if (conn) conn.release();
//   }
// });
// // === ROUTES PRODUITS ===

// // Ajouter un produit avec variantes
// app.post("/api/adm/add/produits", upload.any(), async (req, res) => {
//   try {
//     const { nom, categorie, description, variantes } = req.body;
//     const parsedVariantes = JSON.parse(variantes);

//     const [prodResult] = await pool.execute(
//       "INSERT INTO produits (nom, categorie, description) VALUES (?, ?, ?)",
//       [nom, categorie, description]
//     );

//     const prodId = prodResult.insertId;

//     parsedVariantes.forEach((v, i) => {
//       v.images = {};
//       ["principale", "image_1", "image_2"].forEach((key) => {
//         const file = req.files.find(
//           (f) => f.fieldname === `images_${i}_${key}`
//         );
//         v.images[key] = file ? file.filename : null;
//       });

//       v.prix_promo = v.prix_promo ? v.prix_promo : null;
//     });

//     for (const v of parsedVariantes) {
//       const { options, quantite, prix, prix_promo, images } = v;
//       await pool.execute(
//         "INSERT INTO variantes (produit_id, options, quantite, prix, prix_promo, image_principale, image_1, image_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           prodId,
//           JSON.stringify(options),
//           quantite,
//           prix,
//           prix_promo,
//           images.principale,
//           images.image_1,
//           images.image_2,
//         ]
//       );
//     }

//     res.json({ success: true, message: "Produit ajouté avec variantes !" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Erreur serveur" });
//   }
// });

// // Affichage des produits pour l'admin
// app.get("/api/adm/rec/produits", async (req, res) => {
//   try {
//     const [produits] = await pool.execute("SELECT * FROM produits");

//     const produitsAvecVariantes = await Promise.all(
//       produits.map(async (p) => {
//         const [variantes] = await pool.execute(
//           "SELECT * FROM variantes WHERE produit_id = ?",
//           [p.id]
//         );
//         return {
//           ...p,
//           variantes: variantes.map((v) => ({
//             ...v,
//             images: {
//               principale: v.image_principale,
//               image_1: v.image_1,
//               image_2: v.image_2,
//             },
//           })),
//         };
//       })
//     );

//     res.status(200).json(produitsAvecVariantes);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // server.js (ajoute cette route)
// app.get("/api/adm/rec/produits", async (req, res) => {
//   try {
//     // Test connexion à la base
//     const [rows] = await pool.query("SELECT * FROM produits"); // Assure-toi que la table existe
//     if (!Array.isArray(rows)) {
//       console.error(
//         "Erreur : les résultats de la requête ne sont pas un tableau",
//         rows
//       );
//       return res
//         .status(500)
//         .json({ message: "Erreur interne serveur : résultat invalide" });
//     }

//     res.json(rows);
//   } catch (err) {
//     console.error("Erreur récupération produits :", err);
//     res
//       .status(500)
//       .json({
//         message: "Erreur serveur lors de la récupération des produits",
//         error: err.message,
//       });
//   }
// });

// // Supprimer un produit
// app.delete("/api/adm/supprimer-produit/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.execute("DELETE FROM produits WHERE id = ?", [id]);
//     res.status(200).json({ message: "Produit supprimé avec succès" });
//   } catch (error) {
//     console.error("Erreur lors de la suppression :", error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // Modifier un produit
// app.put("/api/adm/update-produit/:id", upload.any(), async (req, res) => {
//   const conn = await pool.getConnection();
//   try {
//     const { id } = req.params;
//     const { nom, categorie, description } = req.body;

//     await conn.beginTransaction();

//     await conn.execute(
//       `UPDATE produits SET nom = ?, categorie = ?, description = ? WHERE id = ?`,
//       [nom ?? null, categorie ?? null, description ?? null, id]
//     );

//     let variantes = [];
//     if (req.body.variantes) {
//       variantes =
//         typeof req.body.variantes === "string"
//           ? JSON.parse(req.body.variantes)
//           : req.body.variantes;
//     } else {
//       const temp = {};
//       Object.keys(req.body).forEach((k) => {
//         const m = k.match(/^variantes\[(\d+)\]\[(.+)\]$/);
//         if (m) {
//           const idx = m[1];
//           const field = m[2];
//           temp[idx] = temp[idx] || {};
//           temp[idx][field] = req.body[k];
//         }
//       });
//       variantes = Object.keys(temp)
//         .sort((a, b) => Number(a) - Number(b))
//         .map((i) => temp[i]);
//     }

//     const getUploadedFilename = (i, key) => {
//       const candidates = [
//         `variantes[${i}][images][${key}]`,
//         `images_${i}_${key}`,
//         `variantes_${i}_${key}`,
//       ];
//       const f = (req.files || []).find((file) =>
//         candidates.includes(file.fieldname)
//       );
//       return f ? f.filename : null;
//     };

//     variantes = variantes.map((v, idx) => {
//       const result = { ...v };

//       if (typeof result.options === "string") {
//         try {
//           result.options = JSON.parse(result.options);
//         } catch (e) {}
//       }

//       result.quantite =
//         result.quantite !== undefined && result.quantite !== ""
//           ? Number(result.quantite)
//           : null;
//       result.prix =
//         result.prix !== undefined && result.prix !== ""
//           ? Number(result.prix)
//           : null;
//       result.prix_promo =
//         result.prix_promo !== undefined && result.prix_promo !== ""
//           ? Number(result.prix_promo)
//           : null;

//       result.images = result.images || {};
//       ["principale", "image_1", "image_2"].forEach((key) => {
//         const uploadFile = getUploadedFilename(idx, key);
//         if (uploadFile) result.images[key] = uploadFile;
//         else if (
//           result.images[key] === undefined ||
//           result.images[key] === null
//         )
//           result.images[key] = null;
//       });

//       return result;
//     });

//     for (const v of variantes) {
//       const optionsJSON = v.options
//         ? JSON.stringify(v.options)
//         : JSON.stringify({});
//       if (v.id) {
//         await conn.execute(
//           `UPDATE variantes
//            SET options = ?, quantite = ?, prix = ?, prix_promo = ?, image_principale = ?, image_1 = ?, image_2 = ?
//            WHERE id = ? AND produit_id = ?`,
//           [
//             optionsJSON,
//             v.quantite ?? null,
//             v.prix ?? null,
//             v.prix_promo ?? null,
//             v.images.principale ?? null,
//             v.images.image_1 ?? null,
//             v.images.image_2 ?? null,
//             v.id,
//             id,
//           ]
//         );
//       } else {
//         await conn.execute(
//           `INSERT INTO variantes (produit_id, options, quantite, prix, prix_promo, image_principale, image_1, image_2)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             id,
//             optionsJSON,
//             v.quantite ?? 0,
//             v.prix ?? null,
//             v.prix_promo ?? null,
//             v.images.principale ?? null,
//             v.images.image_1 ?? null,
//             v.images.image_2 ?? null,
//           ]
//         );
//       }
//     }

//     await conn.commit();
//     res.json({ success: true, message: "Produit et variantes mis à jour" });
//   } catch (err) {
//     try {
//       await conn.rollback();
//     } catch (e) {}
//     console.error("Erreur update produit :", err);
//     res.status(500).json({ success: false, message: err.message });
//   } finally {
//     try {
//       conn.release();
//     } catch (e) {}
//   }
// });

// // Affichage des produits pour l'accueil
// app.get("/api/rec/produits", async (req, res) => {
//   try {
//     const [rows] = await pool.execute("SELECT * FROM produits");
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des produits :", error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // === ROUTES COMMANDES ===

// // Enregistrement des commandes
// app.post(
//   "/api/commande/create",
//   upload.single("proofImage"),
//   async (req, res) => {
//     try {
//       console.log("Données reçues du front :", req.body);

//       // Récupérer les données du formulaire
//       const commandeData = JSON.parse(req.body.commande);
//       const {
//         userId,
//         adresseLivraison,
//         paiement,
//         mobileMoneyData,
//         items,
//         total,
//       } = commandeData;

//       if (!userId || !adresseLivraison || !paiement || !items || !total) {
//         return res.status(400).json({ message: "Données manquantes" });
//       }

//       let paymentInfo = null;
//       let proofImagePath = null;

//       // Gestion du paiement mobile money
//       if (paiement.startsWith("mobile_money_")) {
//         if (
//           !mobileMoneyData ||
//           !mobileMoneyData.operator ||
//           !mobileMoneyData.clientNumber
//         ) {
//           return res
//             .status(400)
//             .json({ message: "Informations de paiement mobile manquantes" });
//         }

//         // Gérer l'upload de l'image de preuve
//         if (req.file) {
//           proofImagePath = req.file.filename;
//         } else {
//           return res
//             .status(400)
//             .json({ message: "Preuve de transfert manquante" });
//         }

//         paymentInfo = {
//           type: "mobile_money",
//           operator: mobileMoneyData.operator,
//           operatorName: mobileMoneyData.operatorName,
//           sellerNumber: mobileMoneyData.sellerNumber,
//           clientNumber: mobileMoneyData.clientNumber,
//           clientName: mobileMoneyData.clientName,
//           timestamp: mobileMoneyData.timestamp,
//           proofImage: proofImagePath,
//         };
//       }
//       // Gestion du paiement à la livraison
//       else if (paiement === "livraison") {
//         paymentInfo = {
//           type: "livraison",
//         };
//       }
//       // Gestion du paiement par carte (conservé pour compatibilité)
//       else if (paiement === "carte") {
//         if (!cardData || !cardData.numero || !cardData.date || !cardData.cvc) {
//           return res
//             .status(400)
//             .json({ message: "Informations de carte manquantes" });
//         }

//         paymentInfo = {
//           type: "carte",
//           numero: cardData.numero.replace(
//             /\d{12}(\d{4})$/,
//             "**** **** **** $1"
//           ),
//           dateExp: cardData.date,
//         };
//       }

//       // Insérer la commande dans la base de données
//       const [result] = await pool.query(
//         `INSERT INTO commandes (userId, adresseLivraison, paiement, paymentData, items, total, statut)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           userId,
//           JSON.stringify(adresseLivraison),
//           paiement,
//           paymentInfo ? JSON.stringify(paymentInfo) : null,
//           JSON.stringify(items),
//           total,
//           "en_attente", // Statut par défaut
//         ]
//       );

//       return res.status(201).json({
//         message: "Commande enregistrée avec succès",
//         commandeId: result.insertId,
//       });
//     } catch (err) {
//       console.error("Erreur lors de la création de la commande :", err);
//       res
//         .status(500)
//         .json({ message: "Erreur serveur lors de la création de la commande" });
//     }
//   }
// );

// // Afficher les commandes d'un utilisateur
// app.get("/api/commandes/:userId", verifyToken, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (parseInt(userId) !== req.user.id) {
//       return res.status(403).json({ message: "Accès refusé" });
//     }

//     const [rows] = await pool.query(
//       "SELECT id, adresseLivraison, paiement, items, total, etat, createdAt FROM commandes WHERE userId = ? ORDER BY createdAt DESC",
//       [userId]
//     );

//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // Route admin pour récupérer toutes les commandes
// app.get("/api/admin/get-commandes", async (req, res) => {
//   try {
//     const [rows] = await pool.execute(`
//       SELECT c.id, c.etat, c.total, c.adresseLivraison, c.paiement, c.paymentData, c.items, c.createdAt,
//              u.name AS client_nom, u.email AS client_email
//       FROM commandes c
//       JOIN users u ON c.userId = u.id
//       ORDER BY c.createdAt DESC
//     `);

//     const commandes = rows.map((c) => {
//       let adresse = {};
//       let produits = [];
//       let paymentData = {};

//       try {
//         if (typeof c.adresseLivraison === "string") {
//           adresse = JSON.parse(c.adresseLivraison);
//         } else {
//           adresse = c.adresseLivraison || {};
//         }
//       } catch (e) {
//         console.error("Erreur JSON adresseLivraison", c.id, c.adresseLivraison);
//       }

//       try {
//         if (typeof c.items === "string") {
//           let rawItems = c.items
//             .replace(/'/g, '"')
//             .replace(/([a-zA-Z0-9_]+):/g, '"$1":');
//           produits = JSON.parse(rawItems || "[]");
//         } else {
//           produits = c.items || [];
//         }
//       } catch (e) {
//         console.error("Erreur JSON items", c.id, c.items);
//         produits = [];
//       }

//       try {
//         if (c.paymentData && typeof c.paymentData === "string") {
//           paymentData = JSON.parse(c.paymentData);
//         } else {
//           paymentData = c.paymentData || {};
//         }
//       } catch (e) {
//         console.error("Erreur JSON paymentData", c.id, c.paymentData);
//         paymentData = {};
//       }

//       return {
//         id: c.id,
//         etat: c.etat,
//         total: c.total,
//         adresseLivraison: adresse,
//         paiement: c.paiement,
//         paymentData: paymentData,
//         createdAt: c.createdAt,
//         client: { nom: c.client_nom, email: c.client_email },
//         items: produits,
//       };
//     });

//     res.json(commandes);
//   } catch (err) {
//     console.error("Erreur récupération commandes admin :", err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // Route pour mettre à jour l'état d'une commande
// app.put("/api/commandes/:id", async (req, res) => {
//   const { id } = req.params;
//   const { etat } = req.body;

//   const etatsValides = [
//     "en_attente",
//     "validée",
//     "en_livraison",
//     "livrée",
//     "annulée",
//   ];
//   if (!etatsValides.includes(etat)) {
//     return res.status(400).json({ success: false, message: "État invalide." });
//   }

//   try {
//     const [rows] = await pool.execute("SELECT * FROM commandes WHERE id = ?", [
//       id,
//     ]);
//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Commande non trouvée." });
//     }

//     await pool.execute("UPDATE commandes SET etat = ? WHERE id = ?", [
//       etat,
//       id,
//     ]);

//     const [updatedRows] = await pool.execute(
//       "SELECT * FROM commandes WHERE id = ?",
//       [id]
//     );

//     res.json({ success: true, commande: updatedRows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Erreur serveur." });
//   }
// });

// // === ROUTE DE SANTÉ ===
// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "API Olatech est opérationnelle",
//     base_url: BASE_URL,
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//   });
// });

// // === GESTION DES ERREURS 404 ===
// // CORRECTION : Utiliser une route spécifique au lieu de '*'
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route non trouvée: " + req.originalUrl,
//   });
// });

// // === MIDDLEWARE DE GESTION DES ERREURS GLOBAL ===
// app.use((err, req, res, next) => {
//   console.error("Erreur globale:", err);
//   res.status(500).json({
//     success: false,
//     message: "Erreur interne du serveur",
//     error: process.env.NODE_ENV === "development" ? err.message : undefined,
//   });
// });

// // Lancer le serveur
// app.listen(PORT, () => {
//   console.log(` Serveur démarré sur ${BASE_URL}`);
//   console.log(` Environnement: ${process.env.NODE_ENV || "development"}`);
//   console.log(` Port: ${PORT}`);
// });
















// server.js - Configuration pour Aiven
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "votre_clef_secrete_super_safe";

// Configuration pour Render
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// Configuration MySQL pour Aiven avec SSL
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  // SSL obligatoire pour Aiven
  ssl: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  // Support des timezones
  timezone: 'Z',
  charset: 'utf8mb4'
};

console.log("🔧 Configuration DB Aiven:", {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  environment: process.env.NODE_ENV
});

const pool = mysql.createPool(dbConfig);

// Test de connexion à la base de données
async function testDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Connexion à Aiven MySQL réussie');
    
    // Test d'une requête simple
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as server_time');
    console.log('✅ Test de requête SQL réussi:', rows[0]);
    
    // Vérifier si les tables existent
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [process.env.DB_NAME]);
    
    console.log(`📊 Tables dans la base: ${tables.map(t => t.TABLE_NAME).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Aiven:', error.message);
    console.error('🔍 Détails:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
  } finally {
    if (connection) connection.release();
  }
}

// Middlewares
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// CORS pour production
app.use(
  cors({
    origin: [
      "https://gse-front.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware de vérification du token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
}

// Route de santé améliorée
app.get("/api/health", async (req, res) => {
  try {
    const [dbResult] = await pool.execute('SELECT 1 as db_status, NOW() as db_time');
    
    res.json({
      success: true,
      message: "API Olatech est opérationnelle",
      base_url: BASE_URL,
      database: {
        status: "connected",
        test: dbResult[0].db_status,
        time: dbResult[0].db_time
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    res.status(500).json({
      success: false,
      message: "Problème de connexion à la base de données",
      error: error.message,
      base_url: BASE_URL,
      timestamp: new Date().toISOString(),
    });
  }
});

// === ROUTES AUTHENTIFICATION ===

// Enregistrement
app.post("/api/register", async (req, res) => {
  let connection;
  try {
    const { name, email, password } = req.body;

    connection = await pool.getConnection();
    
    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const statue = 1;
    
    await connection.execute(
      "INSERT INTO users (name, email, password, statue) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, statue]
    );
    
    res.status(201).json({ message: "Utilisateur inscrit avec succès" });
  } catch (err) {
    console.error("Erreur inscription:", err);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  } finally {
    if (connection) connection.release();
  }
});

// Connexion
app.post("/api/login", async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    connection = await pool.getConnection();

    // Cas admin hardcodé
    if (
      (email === "root@gmail.com" && password === "Mac-os002") ||
      password === "gildas2006@"
    ) {
      const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({
        token,
        role: "admin",
        message: "Admin connecté",
        user: { id: 0, nom: "Super Admin", email },
      });
    }

    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign({ id: user.id, role: "user" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      role: "user",
      message: "Connexion réussie",
      user: {
        id: user.id,
        nom: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
});

// ... (Le reste de vos routes reste identique)

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée: " + req.originalUrl,
  });
});

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  console.error("Erreur globale:", err);
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Lancer le serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur ${BASE_URL}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔌 Port: ${PORT}`);
  
  // Tester la connexion à la base de données
  await testDatabaseConnection();
});