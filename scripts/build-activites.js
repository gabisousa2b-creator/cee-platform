// Génère public/data/activites.json — liste d'activités professionnelles françaises
// Inspiré de la nomenclature NAF + activités artisanales, libérales, commerciales courantes.
const fs = require('fs');
const path = require('path');

const bases = [
  // ── Agriculture / Élevage / Pêche ──────────────────────────────────────
  "Culture de céréales","Culture de légumes","Culture de fruits","Viticulture","Arboriculture",
  "Horticulture","Maraîchage","Pépinière","Sylviculture","Exploitation forestière","Pêche maritime",
  "Pêche en eau douce","Aquaculture","Pisciculture","Apiculture","Élevage bovin","Élevage porcin",
  "Élevage ovin","Élevage caprin","Élevage avicole","Élevage équin","Élevage cunicole",
  "Services aux cultures","Services à l'élevage","Entretien d'espaces verts","Paysagiste",
  // ── Industries extractives / énergie ──────────────────────────────────
  "Extraction de pierre","Extraction de sable","Extraction de minerais","Extraction de tourbe",
  "Production d'électricité","Production d'énergie solaire","Production d'énergie éolienne",
  "Production hydroélectrique","Distribution de gaz","Distribution d'électricité","Chaufferie urbaine",
  "Traitement de l'eau","Distribution d'eau potable","Collecte des déchets","Tri des déchets",
  "Recyclage","Valorisation des déchets","Dépollution de sites",
  // ── Industries alimentaires ───────────────────────────────────────────
  "Boulangerie","Boulangerie-pâtisserie","Pâtisserie","Viennoiserie","Biscuiterie","Chocolaterie",
  "Confiserie","Glacier","Torréfaction","Brasserie","Distillerie","Fromagerie","Laiterie",
  "Charcuterie","Boucherie","Boucherie-charcuterie","Poissonnerie","Conserverie","Huilerie",
  "Meunerie","Minoterie","Cave coopérative","Vinification","Fabrication de jus de fruits",
  "Fabrication de plats préparés","Traiteur","Salaison","Fumage de poissons",
  // ── Textile / Habillement / Cuir ──────────────────────────────────────
  "Filature","Tissage","Tricotage","Teinturerie industrielle","Confection de vêtements",
  "Prêt-à-porter","Haute couture","Couture sur mesure","Retouches","Chemiserie","Bonneterie",
  "Maroquinerie","Cordonnerie","Sellerie","Fabrication de chaussures","Tapisserie","Ameublement textile",
  "Fabrication de linge de maison",
  // ── Bois / Papier / Imprimerie ────────────────────────────────────────
  "Scierie","Fabrication de parquet","Menuiserie bois","Ébénisterie","Charpente bois","Tonnellerie",
  "Fabrication de palettes","Fabrication de papier","Cartonnerie","Imprimerie","Sérigraphie",
  "Reliure","Façonnage papier","Édition de livres","Édition de journaux","Édition de revues",
  "Édition musicale","Édition logicielle",
  // ── Chimie / Pharmacie / Plastiques ──────────────────────────────────
  "Fabrication de peintures","Fabrication d'encres","Fabrication de colles","Fabrication de vernis",
  "Fabrication de produits chimiques","Fabrication de détergents","Fabrication de cosmétiques",
  "Parfumerie industrielle","Fabrication de savons","Laboratoire pharmaceutique","Fabrication de médicaments",
  "Fabrication de dispositifs médicaux","Fabrication de produits vétérinaires","Fabrication d'emballages plastiques",
  "Fabrication de pièces plastiques","Injection plastique","Extrusion plastique","Fabrication d'emballages carton",
  "Fabrication de caoutchouc","Rechapage de pneumatiques",
  // ── Métallurgie / Mécanique / Électronique ───────────────────────────
  "Sidérurgie","Fonderie","Forge","Chaudronnerie","Tôlerie","Serrurerie","Métallerie","Ferronnerie",
  "Usinage","Tournage","Fraisage","Décolletage","Soudure industrielle","Traitement de surface",
  "Zingage","Galvanisation","Peinture industrielle","Mécanique de précision","Mécanique générale",
  "Fabrication d'outillage","Fabrication de machines-outils","Fabrication d'équipements industriels",
  "Fabrication de composants électroniques","Assemblage électronique","Câblage électronique",
  "Fabrication de cartes électroniques","Fabrication d'appareils électroménagers",
  "Fabrication d'appareils médicaux","Fabrication d'instruments de mesure","Fabrication d'optique",
  "Fabrication de lunettes","Fabrication d'horlogerie","Bijouterie industrielle","Orfèvrerie",
  // ── Automobile / Transport ────────────────────────────────────────────
  "Constructeur automobile","Fabrication d'équipements automobiles","Carrosserie industrielle",
  "Fabrication de remorques","Fabrication de caravanes","Construction navale","Construction aéronautique",
  "Construction ferroviaire","Fabrication de cycles","Fabrication de motocycles",
  // ── Mobilier / Divers ────────────────────────────────────────────────
  "Fabrication de meubles","Fabrication de literie","Fabrication de sièges","Fabrication de cuisines équipées",
  "Fabrication de jouets","Fabrication d'articles de sport","Fabrication d'instruments de musique",
  "Fabrication de stylos","Fabrication d'articles de bureau","Fabrication de jeux de société",
  // ── Construction / BTP ────────────────────────────────────────────────
  "Entreprise générale du bâtiment","Construction de maisons individuelles","Promotion immobilière",
  "Lotisseur","Travaux publics","Terrassement","VRD","Voirie","Réseaux divers","Démolition",
  "Désamiantage","Maçonnerie","Gros œuvre","Béton armé","Construction métallique","Charpente métallique",
  "Charpente traditionnelle","Couverture","Zinguerie","Étanchéité","Isolation thermique","Isolation phonique",
  "Isolation par l'extérieur","Ravalement de façade","Bardage","Plâtrerie","Staff","Cloisons sèches",
  "Plaquiste","Menuiserie intérieure","Menuiserie extérieure","Menuiserie aluminium","Menuiserie PVC",
  "Fermetures","Fabrication de volets","Pose de fenêtres","Vitrerie","Miroiterie","Stores et pergolas",
  "Vérandas","Porte de garage","Fermeture de bâtiment","Serrurerie du bâtiment","Ferronnerie d'art",
  "Métallerie du bâtiment","Électricité générale","Électricien bâtiment","Domotique","Courant faible",
  "Alarme et vidéosurveillance","Installation photovoltaïque","Plomberie","Chauffage","Sanitaire",
  "Climatisation","Ventilation","VMC","Pompe à chaleur","Chaudière à granulés","Poêle à bois",
  "Géothermie","Solaire thermique","Énergies renouvelables","Peinture bâtiment","Décoration intérieure",
  "Revêtement de sols","Carrelage","Parquet","Moquette","Papier peint","Faïence","Ravalement",
  "Aménagement intérieur","Aménagement extérieur","Jardinier paysagiste","Élagage","Piscine et spa",
  "Terrasse bois","Piscinier","Ramonage","Fumisterie",
  // ── Commerce de gros ──────────────────────────────────────────────────
  "Commerce de gros alimentaire","Commerce de gros non alimentaire","Grossiste en boissons",
  "Grossiste en fruits et légumes","Grossiste en viandes","Grossiste en produits laitiers",
  "Grossiste en produits surgelés","Grossiste en matériaux de construction","Grossiste en quincaillerie",
  "Grossiste en produits pharmaceutiques","Grossiste en textile","Grossiste en chaussures",
  "Grossiste en jouets","Grossiste en matériel électrique","Grossiste en fournitures industrielles",
  "Grossiste en machines agricoles","Grossiste en véhicules","Centrale d'achat",
  // ── Commerce de détail ────────────────────────────────────────────────
  "Supermarché","Hypermarché","Supérette","Épicerie","Épicerie fine","Magasin bio","Magasin de surgelés",
  "Caviste","Magasin de vins","Fromagerie détail","Primeur","Boucherie détail","Boulangerie détail",
  "Pâtisserie détail","Chocolaterie détail","Confiserie détail","Torréfaction détail","Tabac-presse",
  "Librairie","Papeterie","Magasin de jouets","Magasin de sport","Magasin de vélos",
  "Magasin de musique","Magasin de bricolage","Quincaillerie","Drogerie","Magasin de meubles",
  "Magasin de literie","Magasin de cuisine","Magasin d'électroménager","Magasin d'informatique",
  "Téléphonie","Magasin de chaussures","Prêt-à-porter femme","Prêt-à-porter homme","Mode enfant",
  "Lingerie","Mercerie","Tissus","Bijouterie","Horlogerie","Optique","Parfumerie","Cosmétiques",
  "Pharmacie","Parapharmacie","Herboristerie","Animalerie","Jardinerie","Fleuriste","Magasin d'art",
  "Antiquités","Brocante","Dépôt-vente","Magasin de décoration","Literie","Arts de la table",
  "Magasin de souvenirs","Station-service","Commerce en ligne","E-commerce","Marketplace",
  "Vente par correspondance","Grande distribution","Magasin d'usine","Magasin d'occasion",
  // ── Transports / Logistique ───────────────────────────────────────────
  "Transport routier de marchandises","Transport de voyageurs","Taxi","VTC","Transport sanitaire",
  "Ambulance","Transport scolaire","Transport international","Déménagement","Messagerie","Fret express",
  "Transport frigorifique","Transport de matières dangereuses","Transport exceptionnel",
  "Logistique","Entreposage","Stockage","Affrètement","Commissionnaire de transport",
  "Transitaire","Agence maritime","Transport fluvial","Transport ferroviaire","Compagnie aérienne",
  "Location de véhicules industriels","Location de véhicules avec chauffeur","Auto-école",
  "Moto-école","Formation routière","Poids lourd",
  // ── Hébergement / Restauration ────────────────────────────────────────
  "Hôtel","Hôtel-restaurant","Gîte rural","Chambre d'hôtes","Camping","Résidence de tourisme",
  "Village vacances","Auberge de jeunesse","Location saisonnière","Restaurant traditionnel",
  "Restaurant gastronomique","Bistrot","Brasserie","Pizzeria","Crêperie","Restaurant rapide",
  "Fast-food","Food truck","Kebab","Sushi","Restaurant asiatique","Restaurant italien",
  "Restaurant oriental","Salon de thé","Café","Bar","Pub","Discothèque","Club de nuit",
  "Débit de boissons","Traiteur événementiel","Restauration collective","Cantine","Restauration d'entreprise",
  // ── Information / Communication ───────────────────────────────────────
  "Édition de logiciels","Développement logiciel","Développement web","Développement mobile",
  "Agence web","Hébergement web","Hébergement de données","Infogérance","SSII","ESN",
  "Conseil en informatique","Conseil en cybersécurité","Cloud computing","Intégration de systèmes",
  "Maintenance informatique","Assistance informatique","Dépannage informatique",
  "Fournisseur d'accès internet","Opérateur télécom","Télécommunications","Audiovisuel",
  "Production audiovisuelle","Production cinématographique","Post-production","Studio d'enregistrement",
  "Édition phonographique","Radio","Télévision","Diffusion radio","Diffusion TV","Agence de presse",
  "Journalisme","Photographie","Reportage","Production de vidéos","Animation 2D/3D","Jeux vidéo",
  "Édition de jeux vidéo","Studio de création","Agence de communication","Agence publicitaire",
  "Graphisme","Design graphique","Infographie","Webdesign","UX/UI design","Community management",
  "Marketing digital","Référencement SEO","Affiliation","Marketing direct","Relations presse",
  "Relations publiques","Événementiel","Organisation d'événements","Salons et foires",
  // ── Finance / Assurance ──────────────────────────────────────────────
  "Banque","Banque en ligne","Établissement de crédit","Caisse de crédit","Société de financement",
  "Courtage en crédit","Conseil en gestion de patrimoine","Gestion d'actifs","Société de bourse",
  "Capital investissement","Crowdfunding","Fintech","Services de paiement","Compagnie d'assurance",
  "Mutuelle","Courtage d'assurance","Assurance vie","Réassurance","Expertise d'assurance",
  // ── Immobilier ────────────────────────────────────────────────────────
  "Agence immobilière","Administration de biens","Syndic de copropriété","Gestion locative",
  "Marchand de biens","Expertise immobilière","Promotion immobilière","Construction-promotion",
  "Location meublée","Location de bureaux","Location de locaux commerciaux","Immobilier d'entreprise",
  "Home staging","Diagnostic immobilier",
  // ── Services professionnels ──────────────────────────────────────────
  "Cabinet d'avocats","Avocat","Notaire","Huissier de justice","Commissaire-priseur",
  "Administrateur judiciaire","Mandataire judiciaire","Expert-comptable","Cabinet comptable",
  "Commissaire aux comptes","Conseil fiscal","Conseil juridique","Conseil en management",
  "Conseil en stratégie","Conseil en organisation","Audit","Conseil RH","Coaching professionnel",
  "Formation professionnelle","Centre de formation","Organisme de formation","Traduction",
  "Interprétation","Rédaction","Copywriting","Relecture","Agence de recrutement","Cabinet de chasse de têtes",
  "Travail temporaire","Intérim","Portage salarial","Conseil en transition","Bilan de compétences",
  "Architecte","Bureau d'études","Ingénierie","Maîtrise d'œuvre","Économiste de la construction",
  "Géomètre-expert","Topographie","Cartographie","Étude de sol","Diagnostic environnemental",
  "Conseil environnemental","Conseil en énergie","Bureau de contrôle","Certification","Inspection technique",
  "Essais et analyses","Laboratoire d'analyses","Analyses biologiques","Recherche scientifique",
  "Recherche appliquée","Bureau d'études techniques","Design industriel","Prototypage",
  // ── Santé / Action sociale ───────────────────────────────────────────
  "Médecin généraliste","Médecin spécialiste","Cabinet médical","Centre de santé","Clinique",
  "Hôpital privé","Maison de santé","Pharmacien","Chirurgien-dentiste","Orthodontiste",
  "Sage-femme","Infirmier","Infirmière libérale","Kinésithérapeute","Ostéopathe","Chiropracteur",
  "Orthophoniste","Orthoptiste","Podologue","Pédicure-podologue","Psychologue","Psychomotricien",
  "Psychothérapeute","Psychiatre","Diététicien","Nutritionniste","Opticien-lunetier","Audioprothésiste",
  "Ambulancier","Laboratoire de biologie médicale","Imagerie médicale","Radiologie","EHPAD",
  "Maison de retraite","Résidence seniors","Service d'aide à domicile","Aide à la personne",
  "Garde d'enfants","Crèche","Micro-crèche","Assistante maternelle","Multi-accueil",
  "Centre de loisirs","Accueil périscolaire","Aide aux devoirs","Soutien scolaire","Cours particuliers",
  "Hébergement social","Foyer d'accueil","ESAT","Structure d'insertion",
  // ── Arts / Culture / Sport / Loisirs ─────────────────────────────────
  "Arts plastiques","Peintre","Sculpteur","Artiste","Galerie d'art","Musée","Centre culturel",
  "Bibliothèque","Médiathèque","Maison de la culture","Théâtre","Compagnie de théâtre","Cirque",
  "Cabaret","Spectacle vivant","Production de spectacles","Organisation de concerts","Salle de concert",
  "Cinéma","Parc d'attractions","Parc animalier","Zoo","Aquarium","Jardin botanique","Site touristique",
  "Visite guidée","Agence de voyages","Tour-opérateur","Office de tourisme","Réceptif","Guide-conférencier",
  "Salle de sport","Fitness","Club de gym","Coach sportif","Professeur de yoga","Professeur de pilates",
  "Arts martiaux","Dojo","Piscine","Centre aquatique","Patinoire","Bowling","Salle d'escalade",
  "Accrobranche","Centre équestre","Poney-club","Golf","Tennis","Club de sport","Association sportive",
  "Organisation de compétitions","École de danse","École de musique","École d'art","Conservatoire",
  "Cours de musique","Cours de chant","Cours de dessin","Atelier créatif","Loisirs créatifs",
  // ── Services personnels ──────────────────────────────────────────────
  "Coiffure","Salon de coiffure","Barbier","Esthétique","Institut de beauté","Spa","Massage bien-être",
  "Onglerie","Manucure","Maquillage professionnel","Tatouage","Piercing","Blanchisserie","Pressing",
  "Laverie automatique","Cordonnerie-multiservices","Reproduction de clés","Toilettage canin",
  "Garde d'animaux","Pompes funèbres","Services funéraires","Marbrerie funéraire","Fleuriste funéraire",
  "Astrologue","Médium","Voyance","Officiant de cérémonie","Wedding planner","Décoration d'événements",
  "Location de matériel événementiel","Photographe mariage","Vidéaste mariage","DJ",
  // ── Artisanat divers ─────────────────────────────────────────────────
  "Ferronnier d'art","Verrier","Souffleur de verre","Céramiste","Potier","Tapissier d'ameublement",
  "Luthier","Facteur d'orgues","Bottier","Tailleur","Fourreur","Chapelier","Modiste","Brodeur",
  "Dentellier","Doreur sur bois","Restaurateur d'art","Encadreur","Relieur","Graveur",
  // ── Secteur public / divers ─────────────────────────────────────────
  "Association loi 1901","Fondation","ONG","Organisation patronale","Syndicat professionnel",
  "Groupement d'employeurs","Coopérative","SCIC","SCOP","SCEA","GAEC","EARL","SCI",
  "Collectivité territoriale","Établissement public","SEM","SPL"
];

// Variantes et qualificatifs pour étoffer la liste
const qualificatifs = [
  "", " (spécialisé)", " (industriel)", " (artisanal)", " (en ligne)"
];
const prefixes = ["", "Import-export — ", "Bureau de — ", "Atelier de — ", "Société de — "];

const set = new Set();
for (const b of bases) set.add(b);
for (const b of bases) {
  for (const q of qualificatifs) {
    if (q) set.add((b + q).trim());
  }
  for (const p of prefixes) {
    if (p) set.add((p + b.toLowerCase()).replace(/— /g, ''));
  }
}

// Tri alphabétique français
const list = Array.from(set).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

const outDir = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'activites.json'), JSON.stringify(list, null, 0), 'utf8');
console.log(`✓ ${list.length} activités écrites dans public/data/activites.json`);
