/**
 * @module scripts/verrerieData
 * @description Données de référence des entreprises verrerie.
 * Exporté séparément pour être utilisé aussi bien par le seed script CLI
 * que par l'endpoint HTTP POST /admin/seed-verrerie.
 */

export const VERRERIE_SEED_DATA = [

  // ── FABRICANTS VERRE PLAT ────────────────────────────────────────────────
  { name: "Saint-Gobain", aliases: ["Saint Gobain", "SGO", "Saint-Gobain S.A.", "Saint Gobain SA", "SG"], category: "FABRICANT_VERRE_PLAT", country: "France" },
  { name: "Saint-Gobain Glass", aliases: ["SGG", "Saint Gobain Glass", "SG Glass"], category: "FABRICANT_VERRE_PLAT", country: "France" },
  { name: "Guardian Industries", aliases: ["Guardian Glass", "Guardian"], category: "FABRICANT_VERRE_PLAT", country: "États-Unis" },
  { name: "NSG Group", aliases: ["Nippon Sheet Glass", "NSG", "Pilkington", "Pilkington Glass"], category: "FABRICANT_VERRE_PLAT", country: "Japon" },
  { name: "AGC Glass", aliases: ["AGC", "Asahi Glass", "AGC Inc", "AGC Flat Glass", "Glaverbel"], category: "FABRICANT_VERRE_PLAT", country: "Belgique" },
  { name: "AGC Glass Europe", aliases: ["AGC Europe", "Splintex", "Stopray"], category: "FABRICANT_VERRE_PLAT", country: "Belgique" },
  { name: "Euroglas", aliases: ["Euroglas GmbH"], category: "FABRICANT_VERRE_PLAT", country: "Allemagne" },
  { name: "Sisecam", aliases: ["Sisecam Group", "Trakya Cam", "Sise cam"], category: "FABRICANT_VERRE_PLAT", country: "Turquie" },
  { name: "Vitro", aliases: ["Vitro Glass", "Vitro SAB"], category: "FABRICANT_VERRE_PLAT", country: "Mexique" },
  { name: "Xinyi Glass", aliases: ["Xinyi"], category: "FABRICANT_VERRE_PLAT", country: "Chine" },
  { name: "CSG Holding", aliases: ["China Southern Glass", "CSG"], category: "FABRICANT_VERRE_PLAT", country: "Chine" },
  { name: "Flat Glass Group", aliases: ["Flat Glass"], category: "FABRICANT_VERRE_PLAT", country: "Chine" },
  { name: "Comptoir General du Verre", aliases: ["CGV"], category: "FABRICANT_VERRE_PLAT", country: "France" },
  { name: "France Verre", aliases: [], category: "FABRICANT_VERRE_PLAT", country: "France" },
  { name: "Euro Verre", aliases: ["Euroverre"], category: "FABRICANT_VERRE_PLAT", country: "France" },

  // ── FABRICANTS VERRE CREUX ───────────────────────────────────────────────
  { name: "Verallia", aliases: ["Verallia SA", "Saint-Gobain Verallia"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Arc International", aliases: ["Arc", "Luminarc", "Arcoroc", "Arcopal", "J.G. Durand", "Durand"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Duralex", aliases: ["Duralex International"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "O-I Glass", aliases: ["Owens-Illinois", "OI Glass", "O-I", "Owens Illinois", "Owens"], category: "FABRICANT_VERRE_CREUX", country: "États-Unis" },
  { name: "Ardagh Group", aliases: ["Ardagh Glass", "Ardagh"], category: "FABRICANT_VERRE_CREUX", country: "Luxembourg" },
  { name: "Saverglass", aliases: ["Saver Glass"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Pochet du Courval", aliases: ["Pochet", "Pochet Group"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "BA Glass", aliases: ["BA Glass Group", "Barbosa Almeida"], category: "FABRICANT_VERRE_CREUX", country: "Portugal" },
  { name: "Vidrala", aliases: ["Vidrala SA"], category: "FABRICANT_VERRE_CREUX", country: "Espagne" },
  { name: "Vetropack", aliases: ["Vetropack Holding"], category: "FABRICANT_VERRE_CREUX", country: "Suisse" },
  { name: "Stoelzle Glass Group", aliases: ["Stoelzle", "Stoelzle Oberglas"], category: "FABRICANT_VERRE_CREUX", country: "Autriche" },
  { name: "Wiegand-Glas", aliases: ["Wiegand Glas"], category: "FABRICANT_VERRE_CREUX", country: "Allemagne" },
  { name: "Encirc", aliases: ["Encirc Glass", "Quinn Glass"], category: "FABRICANT_VERRE_CREUX", country: "Royaume-Uni" },
  { name: "Beatson Clark", aliases: ["Beatson Clark Glass"], category: "FABRICANT_VERRE_CREUX", country: "Royaume-Uni" },
  { name: "Verrerie Ouvriere d'Albi", aliases: ["VOA", "Ouvriere d'Albi"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verrerie de Masnieres", aliases: ["Masnieres"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verrerie Ouvriere", aliases: ["Verrerie Cooperative"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verreries Brosse", aliases: ["Brosse", "Brosse et Cie"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Stolzle-Oberglas", aliases: ["Stolzle"], category: "FABRICANT_VERRE_CREUX", country: "Autriche" },
  { name: "Rexnord Glass", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Durobor", aliases: ["Durobor Glass"], category: "FABRICANT_VERRE_CREUX", country: "Belgique" },
  { name: "Bormioli Rocco", aliases: ["Bormioli"], category: "FABRICANT_VERRE_CREUX", country: "Italie" },
  { name: "Luigi Bormioli", aliases: ["Luigi Bormioli SpA"], category: "FABRICANT_VERRE_CREUX", country: "Italie" },
  { name: "Stolzle-Lausitz", aliases: ["Stolzle Lausitz"], category: "FABRICANT_VERRE_CREUX", country: "Allemagne" },
  { name: "Rastal", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "Allemagne" },
  { name: "Leonardo Glass", aliases: ["Leonardo"], category: "FABRICANT_VERRE_CREUX", country: "Allemagne" },
  { name: "Krosno Glass", aliases: ["Krosno"], category: "FABRICANT_VERRE_CREUX", country: "Pologne" },
  { name: "Vitrocrisa", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "Mexique" },
  { name: "HSL Glassworks", aliases: ["HSL"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verrerie de la Marne", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verrerie du Centre", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verrerie de Cognac", aliases: ["Cognac Glass"], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verreries du Languedoc", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verreries de Masnieres", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "France" },
  { name: "Verreries Pochet", aliases: [], category: "FABRICANT_VERRE_CREUX", country: "France" },

  // ── VERRE PHARMACEUTIQUE ─────────────────────────────────────────────────
  { name: "SGD Pharma", aliases: ["SGD", "SGD Group", "Saint-Gobain Desjonqueres", "Desjonqueres"], category: "VERRE_PHARMACEUTIQUE", country: "France" },
  { name: "Schott AG", aliases: ["Schott", "Schott Glass", "Schott Pharma"], category: "VERRE_PHARMACEUTIQUE", country: "Allemagne" },
  { name: "Nipro Glass", aliases: ["Nipro"], category: "VERRE_PHARMACEUTIQUE", country: "Japon" },
  { name: "Stevanato Group", aliases: ["Stevanato", "Ompi"], category: "VERRE_PHARMACEUTIQUE", country: "Italie" },
  { name: "Bormioli Pharma", aliases: [], category: "VERRE_PHARMACEUTIQUE", country: "Italie" },
  { name: "Wheaton Industries", aliases: ["Wheaton"], category: "VERRE_PHARMACEUTIQUE", country: "États-Unis" },
  { name: "de Dietrich Process Systems", aliases: ["de Dietrich", "DDPS"], category: "VERRE_PHARMACEUTIQUE", country: "France" },
  { name: "Gerresheimer", aliases: ["Gerresheimer AG", "Gerresheimer Glass"], category: "VERRE_PHARMACEUTIQUE", country: "Allemagne" },

  // ── CRISTALLERIE ─────────────────────────────────────────────────────────
  { name: "Baccarat", aliases: ["Cristalleries de Baccarat", "Baccarat Crystal"], category: "CRISTALLERIE", country: "France" },
  { name: "Saint-Louis", aliases: ["Cristalleries Saint-Louis", "Cristal Saint-Louis"], category: "CRISTALLERIE", country: "France" },
  { name: "Lalique", aliases: ["Cristal Lalique", "Lalique SA"], category: "CRISTALLERIE", country: "France" },
  { name: "Daum", aliases: ["Cristalleries de Nancy", "Daum Nancy"], category: "CRISTALLERIE", country: "France" },
  { name: "Swarovski", aliases: ["Swarovski Crystal", "Swarovski AG"], category: "CRISTALLERIE", country: "Autriche" },
  { name: "Riedel", aliases: ["Riedel Glass", "Riedel Crystal"], category: "CRISTALLERIE", country: "Autriche" },
  { name: "Zwiesel Kristallglas", aliases: ["Zwiesel", "Schott Zwiesel"], category: "CRISTALLERIE", country: "Allemagne" },
  { name: "Waterford Crystal", aliases: ["Waterford", "WWRD"], category: "CRISTALLERIE", country: "Irlande" },
  { name: "Bohemia Crystal", aliases: ["Bohemia Glass", "Bohemia"], category: "CRISTALLERIE", country: "République tcheque" },
  { name: "Moser Glassworks", aliases: ["Moser Crystal", "Moser"], category: "CRISTALLERIE", country: "République tcheque" },
  { name: "Cristal d'Arques", aliases: ["Cristal d Arques", "Cristal Arques"], category: "CRISTALLERIE", country: "France" },
  { name: "Val Saint Lambert", aliases: ["Val-Saint-Lambert", "VSL"], category: "CRISTALLERIE", country: "Belgique" },
  { name: "Villeroy Boch", aliases: ["Villeroy and Boch", "Villeroy & Boch", "V&B"], category: "CRISTALLERIE", country: "Allemagne" },
  { name: "Nachtmann", aliases: ["Riedel Nachtmann"], category: "CRISTALLERIE", country: "Allemagne" },
  { name: "Spiegelau", aliases: [], category: "CRISTALLERIE", country: "Allemagne" },

  // ── VERRERIE ARTISTIQUE ──────────────────────────────────────────────────
  { name: "Venini", aliases: ["Venini SpA", "Venini Murano"], category: "VERRERIE_ARTISTIQUE", country: "Italie" },
  { name: "Barovier Toso", aliases: ["Barovier & Toso", "Barovier"], category: "VERRERIE_ARTISTIQUE", country: "Italie" },
  { name: "Seguso", aliases: ["Seguso Vetri d Arte"], category: "VERRERIE_ARTISTIQUE", country: "Italie" },
  { name: "Muranese", aliases: ["Verrerie de Murano", "Murano"], category: "VERRERIE_ARTISTIQUE", country: "Italie" },
  { name: "Blenko Glass", aliases: ["Blenko"], category: "VERRERIE_ARTISTIQUE", country: "États-Unis" },
  { name: "Verrerie Waltersperger", aliases: ["Waltersperger"], category: "VERRERIE_ARTISTIQUE", country: "France" },
  { name: "Pates de verre de Toulouse", aliases: ["Pate de verre"], category: "VERRERIE_ARTISTIQUE", country: "France" },
  { name: "PGO", aliases: ["Pottery Glass Objects", "PGO France"], category: "VERRERIE_ARTISTIQUE", country: "France" },
  { name: "Verrerie de Meisenthal", aliases: ["Meisenthal Glassworks"], category: "VERRERIE_ARTISTIQUE", country: "France" },

  // ── VERRE AUTOMOBILE ─────────────────────────────────────────────────────
  { name: "Saint-Gobain Sekurit", aliases: ["Sekurit", "SGS", "Saint Gobain Sekurit"], category: "VERRE_AUTOMOBILE", country: "France" },
  { name: "Fuyao Glass", aliases: ["Fuyao"], category: "VERRE_AUTOMOBILE", country: "Chine" },
  { name: "NSG Automotive", aliases: ["Pilkington Automotive", "Pilkington Auto"], category: "VERRE_AUTOMOBILE", country: "Japon" },
  { name: "Carglass", aliases: ["Belron", "Carglass France"], category: "VERRE_AUTOMOBILE", country: "France" },

  // ── VERRE BATIMENT ───────────────────────────────────────────────────────
  { name: "Isover", aliases: ["Saint-Gobain Isover", "Isover Glass Wool"], category: "VERRE_BATIMENT", country: "France" },
  { name: "Alliance Verre", aliases: [], category: "VERRE_BATIMENT", country: "France" },
  { name: "Miroiterie du Jura", aliases: [], category: "VERRE_BATIMENT", country: "France" },
  { name: "Miroiterie Generale de France", aliases: ["MGF", "Miroiterie Generale"], category: "VERRE_BATIMENT", country: "France" },
  { name: "Miroiterie de la Loire", aliases: [], category: "VERRE_BATIMENT", country: "France" },
  { name: "Verre et Protections", aliases: ["VP"], category: "VERRE_BATIMENT", country: "France" },

  // ── VERRE SPECIAL / TECHNIQUE ────────────────────────────────────────────
  { name: "Corning", aliases: ["Corning Inc", "Corning Glass"], category: "FABRICANT_VERRE_SPECIAL", country: "États-Unis" },
  { name: "Owens Corning", aliases: ["Owens Corning Glass"], category: "FABRICANT_VERRE_SPECIAL", country: "États-Unis" },
  { name: "Ohara Corporation", aliases: ["Ohara"], category: "FABRICANT_VERRE_SPECIAL", country: "Japon" },
  { name: "Hoya Corporation", aliases: ["Hoya Glass"], category: "FABRICANT_VERRE_SPECIAL", country: "Japon" },
  { name: "Ferro Corporation", aliases: ["Ferro"], category: "FABRICANT_VERRE_SPECIAL", country: "États-Unis" },
  { name: "Novatek International", aliases: ["Novatek"], category: "FABRICANT_VERRE_SPECIAL", country: "France" },

  // ── ORGANISMES DE FORMATION ──────────────────────────────────────────────
  { name: "CIFV", aliases: ["Centre Interprofessionnel de Formation de la Verrerie", "Centre de Formation Verrerie"], category: "ORGANISME_FORMATION", country: "France" },
  { name: "CERFAV", aliases: ["Centre Europeen de Recherches et de Formation aux Arts Verriers"], category: "ORGANISME_FORMATION", country: "France" },
  { name: "Ecole de Verre de Meisenthal", aliases: ["Meisenthal", "Centre International d Art Verrier"], category: "ORGANISME_FORMATION", country: "France" },
  { name: "AFPI Verrerie", aliases: ["AFPI"], category: "ORGANISME_FORMATION", country: "France" },
  { name: "Pole Formation Verrerie", aliases: ["PFV"], category: "ORGANISME_FORMATION", country: "France" },

  // ── SYNDICATS & ASSOCIATIONS ─────────────────────────────────────────────
  { name: "Federation du Verre", aliases: ["Fédération du Verre", "FDV"], category: "SYNDICAT_ASSOCIATION", country: "France" },
  { name: "Comite Professionnel du Verre", aliases: ["CPV"], category: "SYNDICAT_ASSOCIATION", country: "France" },
  { name: "Glass for Europe", aliases: ["GfE"], category: "SYNDICAT_ASSOCIATION", country: "Belgique" },
  { name: "FEVE", aliases: ["Federation Europeenne des Fabricants de Verre d'Emballage", "European Container Glass Federation"], category: "SYNDICAT_ASSOCIATION", country: "Belgique" },
  { name: "Bundesverband Glasindustrie", aliases: ["BV Glas"], category: "SYNDICAT_ASSOCIATION", country: "Allemagne" },
  { name: "British Glass", aliases: ["British Glass Manufacturers"], category: "SYNDICAT_ASSOCIATION", country: "Royaume-Uni" },
  { name: "Alliance Verre et Vitrage", aliases: ["Alliance VV"], category: "SYNDICAT_ASSOCIATION", country: "France" },
  { name: "GIVERBER", aliases: ["Groupement Interprofessionnel du Verre"], category: "SYNDICAT_ASSOCIATION", country: "France" },
  { name: "SNCV", aliases: ["Syndicat National des Cristalliers Verriers"], category: "SYNDICAT_ASSOCIATION", country: "France" },
];
