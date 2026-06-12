# 📄 Portail CRACEO - Documentation Officielle (V2.05)

Bienvenue sur le dépôt officiel du projet **CRACEO**. Cette solution est une application web moderne de gestion de configuration de consultants et de suivi de validation des feuilles de temps (CRA) conçue en collaboration pour **ACEO**.

L'application a été optimisée pour le travail collaboratif à distance (par exemple avec un UX Designer) et intègre un déploiement continu automatisé.

---

## 🚀 Liens Utiles

* **Dépôt GitHub** : [https://github.com/jeremycolard-aceo/Craceo-test](https://github.com/jeremycolard-aceo/Craceo-test)
* **Application Deployée (Live)** : [https://jeremycolard-aceo.github.io/Craceo-test/](https://jeremycolard-aceo.github.io/Craceo-test/)

---

## 🛠️ Stack Technique

L'application est construite sur des bases web modernes, légères et performantes :
* **Framework principal** : React (via Vite)
* **Design & Styles** : CSS Vanille (Design premium, variables HSL personnalisées, glassmorphism, responsive, micro-animations)
* **Icônes** : Lucide React (Lucide Icons)
* **Gestion du State** : State React en mémoire (In-Memory State) pour fluidifier le travail collaboratif sans interférences de cache navigateur local.

---

## 🎨 Fonctionnalités Clés & Expérience Utilisateur (UX)

### 1. Configuration des Consultants (`Consultant Configuration`)
* **Gestion de fiches profils** : Interface complète pour ajouter de nouveaux consultants ou éditer des profils existants (Date d'arrivée, e-mail personnel, e-mail pro, téléphone, manager, mentor, ville de référence/bureau, statut de l'employé, commentaires).
* **Initiales automatisées** : L'avatar de chaque consultant est généré à partir de la concaténation de la première lettre de son prénom et de son nom de famille (ex: Nicolas Sanchez ➔ `NS`).
* **Tableau d'Assignations Actives (Design Figma)** :
  * Les assignations s'affichent sous forme de tableau épuré à l'intérieur d'une carte blanche aux angles arrondis, conforme au design Figma.
  * Les dates sont modifiables via des **sélecteurs de calendrier (Date Pickers)** de type pilule (`date-pill-input`).
  * Les nouveaux clients (`New Client...`) s'affichent automatiquement en orange de marque.
  * Un bouton `×` de suppression apparaît discrètement au survol en bout de ligne.

### 2. Validation des Feuilles de Temps (`Timesheet Validations`)
Le suivi est représenté par un tableau Kanban à 3 colonnes dynamiques :
* **Colonne 1 : CRAs**
  * Affiche la liste des employés ayant des feuilles de temps en attente.
  * L'utilisateur valide les CRAs en cliquant simplement sur les badges (ils passent alors en orange validé). Une fois validée, la carte migre automatiquement dans la colonne suivante.
* **Colonne 2 : Facturation (Billing)**
  * Affiche les consultants dont les CRAs sont validés et qui possèdent des comptes clients actifs.
  * Cliquer sur le badge d'un client ouvre le volet latéral de facturation.
  * **Téléversement de factures / Purchase Orders (Drag & Drop)** : Une zone interactive de glisser-déposer de fichiers permet de lier fictivement le bon de commande. Une fois le document déposé, la zone se transforme en encart de fichier (avec nom du document, témoin de succès vert et bouton de suppression).
* **Colonne 3 : Validation**
  * Dès que tous les clients d'un consultant ont leur bon de commande associé, sa carte passe automatiquement dans cette colonne.
  * Cliquer sur la carte ouvre une modale de validation définitive qui archive le dossier et fait disparaître la carte.

### 3. Volet de Filtre Accordéon Multicritères
* Un bouton **Filter** est intégré en haut à droite de chaque écran.
* Cliquer dessus ouvre un panneau latéral droit affichant 8 catégories de filtres (`Mentor`, `Comments`, `Status`, `Job`, `Office`, `Mail`, `Name`, `CRA`).
* Chaque catégorie se déplie en accordéon pour proposer les valeurs uniques détectées dynamiquement dans la base de données.
* Un badge orange comptabilise le nombre de critères actifs.
* Deux boutons de contrôle en pied de page permettent de tout réinitialiser (**Clear**) ou de fermer le panneau (**Done**).

---

## ⚙️ Configuration du Déploiement Continu (GitHub Pages)

Le déploiement est entièrement pris en charge par GitHub Actions à chaque modification de la branche `main`. Pour activer la publication en ligne sur votre dépôt :

1. Allez dans les paramètres de votre dépôt GitHub : **Settings**.
2. Dans la colonne de gauche, cliquez sur **Pages** (sous la rubrique *Code and automation*).
3. Dans la section **Build and deployment** :
   * Sous **Source**, remplacez l'option par défaut *Deploy from a branch* par **GitHub Actions**.
4. C'est tout ! L'intégration continue va lancer le build et publier l'application en quelques secondes.

---

## 💻 Démarrage en Développement Local

Pour lancer le projet sur votre propre machine :

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/jeremycolard-aceo/Craceo-test.git
   cd Craceo-test
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement local** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:5173/](http://localhost:5173/).

4. **Compiler le bundle de production** :
   ```bash
   npm run build
   ```
   Les fichiers optimisés pour la mise en ligne seront générés dans le dossier `/dist`.

---

## 📁 Structure des Fichiers Clés

```text
├── .github/workflows/deploy.yml   # Script d'intégration et déploiement continu GitHub Pages
├── public/
│   ├── media/
│   │   └── aceo.png               # Logo officiel du header
│   └── icons.svg
├── src/
│   ├── App.jsx                    # Point d'entrée de l'application & gestion des filtres
│   ├── index.css                  # Design system de l'app (CSS Vanille, variables, modales)
│   ├── data.js                    # Jeu de données d'origine (Consultants, CRAs, Missions)
│   ├── Sidebar.jsx                # Barre de navigation latérale
│   ├── Topbar.jsx                 # Barre de recherche centrée, logo et bouton refresh
│   ├── ConsultantConfiguration.jsx # Vue configuration des consultants (Fiche détail & Tableau Figma)
│   ├── ValidationsPipeline.jsx    # Tableau Kanban click-driven, volet facturation & drag-drop PO
│   └── FilterSidebar.jsx          # Volet de filtrage accordéon multicritères dynamique
├── vite.config.js                 # Configuration Vite avec Base Path pour GitHub Pages
└── package.json                   # Dépendances et scripts de build
```

---

## 🔮 Spécifications Backend Futures (Roadmap)

Lors du passage d'une maquette frontend statique (état en mémoire) à une architecture client-serveur avec base de données (ex: Cloud SQL), veuillez implémenter les fonctionnalités backend automatisées suivantes :

### 1. Génération Mensuelle des Cartes de Validation
- **Tous les premiers du mois** : Une tâche planifiée (cron job) ou un déclencheur applicatif doit créer automatiquement de nouvelles cartes d'activité de feuille de temps (CRA) pour chaque consultant qui possède une mission/assignation client active sur le mois en cours.

### 2. Notifications & Alertes Automatiques de Fin de Mois
- **Tous les premiers du mois** : Le serveur backend doit analyser les cartes du mois écoulé pour identifier les retards et déclencher trois notifications d'alerte globales (voir gabarits ci-dessous).

### 3. Gabarits des Notifications Applicatives (Notification Templates)

L'ensemble des notifications générées par les actions utilisateurs et les processus automatisés doit respecter les gabarits de messages textuels suivants (les placeholders doivent être entourés de doubles astérisques `**` pour le formatage en gras et en couleur dans l'interface) :

#### A. Étape 1 : Validation de Feuille de Temps (CRA)
- **Validation** :
  `The CRA **[CRA Name]** for **[Month]** has been validated by **[Manager]** for **[Consultant]**.`
  *Exemple* : `The CRA **BOOND** for **October** has been validated by **Marie Dubois** for the consultant **Nicolas Sanchez**.`
- **Invalidation/Demande de Correction** :
  `The CRA **[CRA Name]** for **[Month]** has been unvalidated for correction by **[Manager]** for **[Consultant]**.`

#### B. Étape 2 : Envoi de la Facture (Billing)
- **Validation de l'Envoi** :
  `Invoice for **[Client/Project]** has been marked as sent by **[Manager]** for **[Consultant]**.`
  *Exemple* : `Invoice for **Air Liquide** has been marked as sent by **Marie Dubois** for **Nicolas Sanchez**.`

#### C. Étape 3 : Validation Finale & Archivage (Final Validation)
- **Validation Individuelle** :
  `The complete workflow for **[Consultant]** has been validated.`
  *Exemple* : `The complete workflow for **Nicolas Sanchez** has been validated.`
- **Validation Groupée (En Masse)** :
  `The complete workflow for **[Number]** consultants has been validated.`
  *Exemple* : `The complete workflow for **3** consultants has been validated.`
  *Note* : Lorsque le nombre de consultants validés en masse est supérieur à 2, l'interface propose un lien cliquable orange permettant d'ouvrir un pop-up modal détaillant la liste complète des noms concernés.

#### D. Actions d'Annulation (Undo Action)
- **Restauration de l'état précédent** :
  `The last action concerning **[Consultant]** has been canceled by **[Manager]**.`
  *Exemple* : `The last action concerning **Nicolas Sanchez** has been canceled by **Marie Dubois**.`

#### E. Alertes Mensuelles Systèmes (Tous les 1er du mois)
- **CRAs en attente** :
  `The CRAs of **[List of Concerned Consultants]** have not been validated.`
  *Exemple* : `The CRAs of **Nicolas Sanchez** and **Guillaume Duluc** have not been validated.`
- **Factures/Invoices en attente** :
  `The invoices for **[List of Concerned Consultants]** have not been sent.`
  *Exemple* : `The invoices for **Guillaume Duluc** and **Quentin Astarie** have not been sent.`
- **Validations Finales en attente** :
  `The final validation for **[List of Concerned Consultants]** has not been completed.`
  *Exemple* : `The final validation for **Nicolas Sanchez** has not been completed.`

