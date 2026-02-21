# CareCanvas 🌱
### Van Verbeelding naar Zorgkracht

> *"De toekomst van de zorg wordt niet geschreven in code, maar gedroomd in visie en gevormd door samenwerking."*

CareCanvas is een open-source, AI-gestuurd co-creatieplatform dat de brug slaat tussen menselijke verbeelding en werkende zorgoplossingen. Iedereen die een zorgvisie heeft — arts, verpleegkundige, patiënt, beleidsmaker, developer — kan hier een idee inbrengen en het stap voor stap omzetten naar een implementeerbare blauwdruk.

**De kunst van het bouwen is verschoven naar de kracht van de verbeelding.**

---

## ✨ Wat doet het platform?

CareCanvas begeleidt je door vijf stappen — van ruwe gedachte tot exporteerbare blauwdruk:

| Stap | Naam | Wat gebeurt er? |
|------|------|-----------------|
| 1 | 💬 **Sparring-Partner** | AI scherpt je zorgvisie aan via Socratische vragen |
| 2 | 🗺️ **Scenario-Mapper** | Jouw verhaal wordt een visueel procesdiagram |
| 3 | 📋 **Spec-Generator** | User Stories, datamodel en API-contracten worden gegenereerd |
| 4 | 🛡️ **Compliance-check** | Automatische toetsing aan AVG, NEN 7510 en WGBO |
| 5 | 📦 **Blueprint** | Alles gebundeld in een exporteerbaar pakket voor developers |

---

## 🚀 Snelstart

### Vereisten
- Node.js 18+
- Een [Anthropic API-sleutel](https://console.anthropic.com)

### Installatie

```bash
# 1. Clone het project
git clone https://github.com/jouw-gebruikersnaam/carecanvas.git
cd carecanvas

# 2. Installeer dependencies
npm install

# 3. Maak een .env bestand aan
cp .env.example .env
```

Vul je API-sleutel in in het `.env` bestand:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

```bash
# 4. Start de ontwikkelserver
npm run dev
```

Open dan [http://localhost:5173](http://localhost:5173) en kies je rol.

---

## 🏗️ Projectstructuur

```
carecanvas/
├── src/
│   ├── components/          # UI-componenten per stap
│   │   ├── Onboarding.jsx   # Rolkeuze en API-setup
│   │   ├── SparringPartner.jsx
│   │   ├── ScenarioMapper.jsx
│   │   ├── SpecGenerator.jsx
│   │   ├── ComplianceCheck.jsx
│   │   └── Blueprint.jsx
│   ├── hooks/
│   │   └── useClaude.js     # Centrale Claude API hook
│   ├── lib/
│   │   └── prompts.js       # Alle AI system prompts
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎭 Rollen

CareCanvas is ontworpen voor iedereen in het zorgecosysteem. Elke rol draagt een unieke bijdrage:

| Rol | Wie | Bijdrage |
|-----|-----|----------|
| 🌱 **Dromer** | Zorgprofessional, patiënt | De oorspronkelijke visie en het menselijk perspectief |
| 🧭 **Gids** | Ervaren zorgverlener, ethicus | Inhoudelijke validatie en domeinkennis |
| ⚙️ **Architect** | Informatiespecialist, UX-designer | Vertaling naar werkbare specificaties |
| 🔨 **Bouwer** | Developer, leverancier | Implementatie van de blauwdruk |
| ✅ **Validator** | Privacy-officer, patiëntvertegenwoordiger | Formele goedkeuringen en stempels |
| 💙 **Patiënt** | Ervaringsdeskundige | Het fundament van elk ontwerp |

---

## 🧱 De Grondwet

Elk project dat via CareCanvas tot stand komt, wordt getoetst aan vier ononderhandelbare principes:

1. **Menselijke Maat** — Technologie dient de zorgverlener en patiënt, niet andersom
2. **Interoperabiliteit** — Alles communiceert met bestaande systemen (ZIB's / FHIR R4)
3. **Radicale Transparantie** — Alle ontwerpen en AI-redenering zijn inzichtelijk
4. **Inclusief Eigenaarschap** — Patiënten zijn medeontwerpende stemmen, geen testsubjecten

---

## 🛠️ Tech Stack

| Laag | Technologie |
|------|-------------|
| Frontend | React 18 + Vite |
| AI | [Anthropic Claude](https://anthropic.com) (claude-sonnet-4) |
| Styling | CSS custom properties (geen framework) |
| Fonts | Fraunces + DM Sans |
| Standaarden | FHIR R4, ZIB 2020, OpenAPI 3.0 |

---

## 🗺️ Roadmap

- [ ] **v0.2** — Gebruikersaccounts en projectopslag (Supabase)
- [ ] **v0.3** — Rol-Matching: andere gebruikers koppelen aan een project
- [ ] **v0.4** — Open-Source Bibliotheek van herbruikbare bouwblokken
- [ ] **v0.5** — FHIR Bundle export voor directe EPD-integratie
- [ ] **v1.0** — Multi-tenant platform voor zorginstellingen

---

## 🤝 Bijdragen

CareCanvas is gebouwd op het idee dat de beste zorginnovaties ontstaan door samenwerking. Bijdragen zijn van harte welkom.

```bash
# Fork het project, maak een branch aan
git checkout -b feature/jouw-idee

# Commit je wijzigingen
git commit -m 'Add: korte beschrijving'

# Push en open een Pull Request
git push origin feature/jouw-idee
```

Lees voor grotere wijzigingen eerst [CONTRIBUTING.md](CONTRIBUTING.md) of open een Issue om je idee te bespreken.

---

## ⚠️ Belangrijk voor productie

De huidige versie stuurt API-aanroepen direct vanuit de browser. **Gebruik voor productie een eigen backend als proxy** zodat je API-sleutel nooit publiek zichtbaar is.

```
Browser → Jouw backend (proxy) → Anthropic API
```

---

## 📄 Licentie

MIT — vrij te gebruiken, aanpassen en verspreiden. Zie [LICENSE](LICENSE).

---

## 💬 Contact & Community

Heb je een zorgvisie die je wilt delen, of wil je meedenken over de doorontwikkeling?  
Open een [Discussion](../../discussions) of stuur een bericht.

---

<div align="center">
  <sub>Gebouwd met ❤️ voor de zorg van morgen</sub>
</div>
