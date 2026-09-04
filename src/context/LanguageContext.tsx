import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Language = 'ro' | 'en' | 'de' | 'hu'

const translations = {
  ro: {
    evDatabase: 'Bază EV', compare: 'Compară', calculator: 'Calculator', engineeringLab: 'Laborator de inginerie',
    km: 'KM', mi: 'MI', journeyInputs: 'Date călătorie', energyPlan: 'Plan de energie și încărcare',
    vehicle: 'Vehicul', selectEv: 'Selectează un EV', loadingVehicles: 'Se încarcă datele vehiculelor...',
    journeyDistance: 'Distanța călătoriei', ambientTemperature: 'Temperatura exterioară', averageSpeed: 'Viteza medie',
    passengers: 'Pasageri', cargoLoad: 'Încărcătură', startingCharge: 'Încărcare inițială', arrivalReserve: 'Rezervă la sosire', chargerPower: 'Puterea încărcătorului',
    adjustedConsumption: 'Consum ajustat', usableBattery: 'Baterie utilizabilă', expectedRange: 'Autonomie estimată', tripEnergy: 'Energie călătorie', vehiclePrice: 'Preț vehicul',
    finalCharge: 'Încărcare finală', chargingStops: 'Opriri pentru încărcare', chargingRequired: 'Încărcare necesară', noChargingRequired: 'Nu este necesară încărcarea',
    assumptions: 'Ipoteze și detalii formule', show: 'Afișează', hide: 'Ascunde', people: 'persoane',
    planningEstimate: 'Estimare de planificare, nu recomandare de siguranță sau valoare a producătorului.',
    simulationWorkspace: 'Spațiu de simulare', transparentJourney: 'Estimări transparente bazate pe datele vehiculului și ipotezele de utilizare.',
    language: 'Limbă', romanian: 'Română', english: 'Engleză', german: 'Germană', hungarian: 'Maghiară',
    heroTag: 'Platformă de inteligență EV', heroLead: 'Explorează specificații, compară vehicule electrice și calculează autonomia reală cu calculatorul nostru avansat.', browseEvs: 'Vezi vehiculele EV', rangeCalculator: 'Calculator autonomie', electricVehicles: 'Vehicule electrice', evBrands: 'Mărci EV', maxWltpRange: 'Autonomie WLTP maximă', averageEfficiency: 'Eficiență medie',
      driveThe: 'Condu', electric: 'electric', future: 'viitorul',
  },
  en: {
    evDatabase: 'EV Database', compare: 'Compare', calculator: 'Calculator', engineeringLab: 'Engineering Lab',
    km: 'KM', mi: 'MI', journeyInputs: 'Journey inputs', energyPlan: 'Energy and charging plan',
    vehicle: 'Vehicle', selectEv: 'Select an EV', loadingVehicles: 'Loading vehicle data...',
    journeyDistance: 'Journey distance', ambientTemperature: 'Ambient temperature', averageSpeed: 'Average speed',
    passengers: 'Passengers', cargoLoad: 'Cargo load', startingCharge: 'Starting charge', arrivalReserve: 'Arrival reserve', chargerPower: 'Charger power',
    adjustedConsumption: 'Adjusted consumption', usableBattery: 'Usable battery', expectedRange: 'Expected range', tripEnergy: 'Trip energy', vehiclePrice: 'Vehicle price',
    finalCharge: 'Final charge', chargingStops: 'Charging stops', chargingRequired: 'Charging required', noChargingRequired: 'No charging required',
    assumptions: 'Assumptions and formula details', show: 'Show', hide: 'Hide', people: 'people',
    planningEstimate: 'Planning estimate, not manufacturer or safety-critical guidance.',
    simulationWorkspace: 'Simulation workspace', transparentJourney: 'Transparent journey estimates based on vehicle data and stated operating assumptions.',
    language: 'Language', romanian: 'Romanian', english: 'English', german: 'German', hungarian: 'Hungarian',
    heroTag: 'The EV Intelligence Platform', heroLead: 'Explore specifications, compare electric vehicles, and calculate real-world range with our advanced calculator.', browseEvs: 'Browse EVs', rangeCalculator: 'Range Calculator', electricVehicles: 'Electric Vehicles', evBrands: 'EV Brands', maxWltpRange: 'Max WLTP Range', averageEfficiency: 'Average Efficiency',
      driveThe: 'Drive the', electric: 'Electric', future: 'Future',
  },
  de: {
    evDatabase: 'EV-Datenbank', compare: 'Vergleichen', calculator: 'Rechner', engineeringLab: 'Techniklabor',
    km: 'KM', mi: 'MI', journeyInputs: 'Fahrtdaten', energyPlan: 'Energie- und Ladeplan',
    vehicle: 'Fahrzeug', selectEv: 'EV auswählen', loadingVehicles: 'Fahrzeugdaten werden geladen...',
    journeyDistance: 'Fahrstrecke', ambientTemperature: 'Außentemperatur', averageSpeed: 'Durchschnittsgeschwindigkeit',
    passengers: 'Passagiere', cargoLoad: 'Gepäck', startingCharge: 'Startladung', arrivalReserve: 'Reserve bei Ankunft', chargerPower: 'Ladeleistung',
    adjustedConsumption: 'Angepasster Verbrauch', usableBattery: 'Nutzbare Batterie', expectedRange: 'Geschätzte Reichweite', tripEnergy: 'Fahrtenergie', vehiclePrice: 'Fahrzeugpreis',
    finalCharge: 'Ladestand am Ziel', chargingStops: 'Ladestopps', chargingRequired: 'Laden erforderlich', noChargingRequired: 'Kein Laden erforderlich',
    assumptions: 'Annahmen und Formeldetails', show: 'Anzeigen', hide: 'Ausblenden', people: 'Personen',
    planningEstimate: 'Planungsschätzung, keine Hersteller- oder sicherheitskritische Angabe.',
    simulationWorkspace: 'Simulationsarbeitsbereich', transparentJourney: 'Transparente Fahrtabschätzungen auf Basis von Fahrzeugdaten und Annahmen.',
    language: 'Sprache', romanian: 'Rumänisch', english: 'Englisch', german: 'Deutsch', hungarian: 'Ungarisch',
    heroTag: 'Die EV-Intelligenzplattform', heroLead: 'Entdecken Sie technische Daten, vergleichen Sie Elektrofahrzeuge und berechnen Sie die reale Reichweite.', browseEvs: 'EVs ansehen', rangeCalculator: 'Reichweitenrechner', electricVehicles: 'Elektrofahrzeuge', evBrands: 'EV-Marken', maxWltpRange: 'Maximale WLTP-Reichweite', averageEfficiency: 'Durchschnittliche Effizienz',
      driveThe: 'Fahren Sie', electric: 'elektrisch', future: 'in die Zukunft',
  },
  hu: {
    evDatabase: 'EV adatbázis', compare: 'Összehasonlítás', calculator: 'Kalkulátor', engineeringLab: 'Mérnöki labor',
    km: 'KM', mi: 'MI', journeyInputs: 'Utazási adatok', energyPlan: 'Energia- és töltési terv',
    vehicle: 'Jármű', selectEv: 'EV kiválasztása', loadingVehicles: 'Járműadatok betöltése...',
    journeyDistance: 'Utazási távolság', ambientTemperature: 'Külső hőmérséklet', averageSpeed: 'Átlagsebesség',
    passengers: 'Utasok', cargoLoad: 'Rakomány', startingCharge: 'Kezdő töltés', arrivalReserve: 'Érkezési tartalék', chargerPower: 'Töltő teljesítménye',
    adjustedConsumption: 'Módosított fogyasztás', usableBattery: 'Használható akkumulátor', expectedRange: 'Becsült hatótáv', tripEnergy: 'Utazási energia', vehiclePrice: 'Jármű ára',
    finalCharge: 'Végső töltés', chargingStops: 'Töltési megállók', chargingRequired: 'Töltés szükséges', noChargingRequired: 'Nem szükséges töltés',
    assumptions: 'Feltételezések és képletrészletek', show: 'Mutat', hide: 'Elrejt', people: 'fő',
    planningEstimate: 'Tervezési becslés, nem gyártói vagy biztonságkritikus útmutatás.',
    simulationWorkspace: 'Szimulációs munkatér', transparentJourney: 'Átlátható utazási becslések járműadatok és feltételezések alapján.',
    language: 'Nyelv', romanian: 'Román', english: 'Angol', german: 'Német', hungarian: 'Magyar',
    heroTag: 'EV-intelligencia platform', heroLead: 'Fedezze fel a specifikációkat, hasonlítsa össze az elektromos járműveket és számolja ki a valós hatótávot.', browseEvs: 'EV-k megtekintése', rangeCalculator: 'Hatótáv-kalkulátor', electricVehicles: 'Elektromos járművek', evBrands: 'EV-márkák', maxWltpRange: 'Maximális WLTP hatótáv', averageEfficiency: 'Átlagos hatékonyság',
      driveThe: 'Vezessen', electric: 'elektromosan', future: 'a jövő felé',
  },
} as const

const specificationTranslations: Record<Language, Record<string, string>> = {
  en: {},
  ro: {
    'Performance': 'Performanță', 'Battery & Charging': 'Baterie și încărcare', 'Dimensions': 'Dimensiuni', 'Efficiency': 'Eficiență', 'Features': 'Dotări',
    'Acceleration 0-100 km/h': 'Accelerație 0-100 km/h', 'Top Speed': 'Viteză maximă', 'Maximum Power': 'Putere maximă', 'Maximum Torque': 'Cuplu maxim',
    'Battery Type': 'Tip baterie', 'Battery Capacity': 'Capacitate baterie', 'Usable Battery Capacity': 'Capacitate baterie utilizabilă', 'Maximum DC Charging Power': 'Putere maximă de încărcare DC',
    'Length': 'Lungime', 'Width': 'Lățime', 'Height': 'Înălțime', 'Wheelbase': 'Ampatament', 'Ground Clearance': 'Gardă la sol', 'Trunk Capacity': 'Capacitate portbagaj', 'Frunk Capacity': 'Capacitate portbagaj față', 'Curb Weight': 'Masă proprie',
    'WLTP Range': 'Autonomie WLTP', 'EPA Range': 'Autonomie EPA', 'Energy Consumption': 'Consum de energie', 'CO2 Emissions': 'Emisii CO2',
    'Drive Type': 'Tip tracțiune', 'Drive Modes': 'Moduri de condus', 'Heat Pump': 'Pompă de căldură', 'Display Size': 'Dimensiune ecran', 'Sound System': 'Sistem audio', 'Over-the-air Updates': 'Actualizări over-the-air', 'Status': 'Stare',
    'Charging Time': 'Timp de încărcare', 'Starting Price': 'Preț de pornire', 'Battery': 'Baterie', 'Model Year': 'An model', 'Specification': 'Specificație', 'Core Performance': 'Performanță de bază',
  },
  de: {
    'Performance': 'Leistung', 'Battery & Charging': 'Batterie und Laden', 'Dimensions': 'Abmessungen', 'Efficiency': 'Effizienz', 'Features': 'Ausstattung',
    'Acceleration 0-100 km/h': 'Beschleunigung 0-100 km/h', 'Top Speed': 'Höchstgeschwindigkeit', 'Maximum Power': 'Maximale Leistung', 'Maximum Torque': 'Maximales Drehmoment',
    'Battery Type': 'Batterietyp', 'Battery Capacity': 'Batteriekapazität', 'Usable Battery Capacity': 'Nutzbare Batteriekapazität', 'Maximum DC Charging Power': 'Maximale DC-Ladeleistung',
    'Length': 'Länge', 'Width': 'Breite', 'Height': 'Höhe', 'Wheelbase': 'Radstand', 'Ground Clearance': 'Bodenfreiheit', 'Trunk Capacity': 'Kofferraumvolumen', 'Frunk Capacity': 'Frunk-Volumen', 'Curb Weight': 'Leergewicht',
    'WLTP Range': 'WLTP-Reichweite', 'EPA Range': 'EPA-Reichweite', 'Energy Consumption': 'Energieverbrauch', 'CO2 Emissions': 'CO2-Emissionen',
    'Drive Type': 'Antriebsart', 'Drive Modes': 'Fahrmodi', 'Heat Pump': 'Wärmepumpe', 'Display Size': 'Displaygröße', 'Sound System': 'Soundsystem', 'Over-the-air Updates': 'Over-the-Air-Updates', 'Status': 'Status',
    'Charging Time': 'Ladezeit', 'Starting Price': 'Startpreis', 'Battery': 'Batterie', 'Model Year': 'Modelljahr', 'Specification': 'Spezifikation', 'Core Performance': 'Grundleistung',
  },
  hu: {
    'Performance': 'Teljesítmény', 'Battery & Charging': 'Akkumulátor és töltés', 'Dimensions': 'Méretek', 'Efficiency': 'Hatékonyság', 'Features': 'Felszereltség',
    'Acceleration 0-100 km/h': 'Gyorsulás 0-100 km/h', 'Top Speed': 'Végsebesség', 'Maximum Power': 'Maximális teljesítmény', 'Maximum Torque': 'Maximális nyomaték',
    'Battery Type': 'Akkumulátor típusa', 'Battery Capacity': 'Akkumulátor-kapacitás', 'Usable Battery Capacity': 'Használható akkumulátor-kapacitás', 'Maximum DC Charging Power': 'Maximális DC töltőteljesítmény',
    'Length': 'Hossz', 'Width': 'Szélesség', 'Height': 'Magasság', 'Wheelbase': 'Tengelytáv', 'Ground Clearance': 'Hasmagasság', 'Trunk Capacity': 'Csomagtér-kapacitás', 'Frunk Capacity': 'Első csomagtér-kapacitás', 'Curb Weight': 'Menetkész tömeg',
    'WLTP Range': 'WLTP hatótáv', 'EPA Range': 'EPA hatótáv', 'Energy Consumption': 'Energiafogyasztás', 'CO2 Emissions': 'CO2-kibocsátás',
    'Drive Type': 'Hajtás típusa', 'Drive Modes': 'Vezetési módok', 'Heat Pump': 'Hőszivattyú', 'Display Size': 'Kijelző mérete', 'Sound System': 'Hangrendszer', 'Over-the-air Updates': 'Vezeték nélküli frissítések', 'Status': 'Állapot',
    'Charging Time': 'Töltési idő', 'Starting Price': 'Kezdőár', 'Battery': 'Akkumulátor', 'Model Year': 'Modellév', 'Specification': 'Specifikáció', 'Core Performance': 'Alapteljesítmény',
  },
}

const interfaceTranslations: Record<Language, Record<string, string>> = {
  en: {},
  ro: {
    'Range Calculator': 'Calculator autonomie', 'Advanced multi-variable range estimator. Configure real-world conditions to predict your actual driving range with high accuracy.': 'Estimator avansat de autonomie cu mai multe variabile. Configureaza conditiile reale pentru a estima autonomia.',
    'SELECT VEHICLE': 'SELECTEAZA VEHICUL', 'Choose a vehicle': 'Alege un vehicul', 'Environmental Conditions': 'Conditii de mediu', 'Ambient Temperature': 'Temperatura exterioara', 'Average Speed': 'Viteza medie', 'Wind Conditions': 'Conditii de vant', 'No Wind': 'Fara vant', 'Tailwind': 'Vant din spate', 'Light Headwind': 'Vant frontal usor', 'Strong Headwind': 'Vant frontal puternic', 'Terrain': 'Teren', 'Flat': 'Plat', 'Hilly': 'Deluros', 'Mountain': 'Muntos', 'Driving Style & Load': 'Stil de condus si incarcare', 'Driving Style': 'Stil de condus', 'Normal': 'Normal', 'Highway': 'Autostrada', 'Sport': 'Sport', 'Climate Control (HVAC)': 'Control climatizare (HVAC)', 'Off': 'Oprit', 'Heat': 'Incalzire', 'A/C': 'Aer conditionat', 'Battery & Trip Planning': 'Baterie si planificare calatorie', 'Battery State of Health': 'Stare de sanatate baterie', 'Trip Distance (optional)': 'Distanta calatoriei (optional)', 'Enter trip distance in km...': 'Introdu distanta in km...', 'Reset all settings': 'Reseteaza toate setarile', 'Select a vehicle': 'Selecteaza un vehicul', 'Estimated Real-World Range': 'Autonomie reala estimata', 'Consumption': 'Consum', 'vs WLTP': 'fata de WLTP', 'Factor Breakdown': 'Analiza factori', 'Temperature': 'Temperatura', 'Speed': 'Viteza', 'Passengers & Cargo': 'Pasageri si incarcare', 'Battery Health': 'Sanatatea bateriei', 'Combined Factor': 'Factor combinat',
    'Search brand, model...': 'Cauta marca, model...', 'Default order': 'Ordine implicita', 'Range: High to Low': 'Autonomie: mare la mica', 'Range: Low to High': 'Autonomie: mica la mare', 'Price: Low to High': 'Pret: mic la mare', 'Price: High to Low': 'Pret: mare la mic', 'Battery: High to Low': 'Baterie: mare la mica', 'Name: A to Z': 'Nume: A la Z', 'Brands': 'Marci', 'Filters': 'Filtre', 'Clear': 'Sterge', 'Max Price': 'Pret maxim', 'Any': 'Oricare', 'Min Range': 'Autonomie minima', 'Drive Type': 'Tip tractiune', 'All': 'Toate', 'vehicles': 'vehicule', 'Loading...': 'Se incarca...', 'No vehicles match your filters': 'Niciun vehicul nu corespunde filtrelor', 'Try adjusting or clearing your filters': 'Ajusteaza sau sterge filtrele', 'Clear all filters': 'Sterge toate filtrele', 'Range': 'Autonomie', 'Starting from': 'De la', 'Discontinued': 'Scos din productie', 'View full specs': 'Vezi specificatiile complete', 'Add to compare': 'Adauga la comparatie', 'Remove from compare': 'Elimina din comparatie', 'Close': 'Inchide', 'Loading specifications...': 'Se incarca specificatiile...', 'Compare Vehicles': 'Compara vehicule', 'No vehicles selected': 'Nu sunt vehicule selectate', 'Clear All': 'Sterge tot', 'Remove': 'Elimina', 'Loading specs...': 'Se incarca specificatiile...', 'Hide Specs Table': 'Ascunde tabelul de specificatii', 'View Full Specs Comparison': 'Vezi comparatia completa a specificatiilor', 'Detailed specifications not available for the selected vehicles.': 'Specificatiile detaliate nu sunt disponibile pentru vehiculele selectate.',
  },
  de: { 'Range Calculator': 'Reichweitenrechner', 'SELECT VEHICLE': 'FAHRZEUG AUSWAHLEN', 'Choose a vehicle': 'Fahrzeug auswahlen', 'Environmental Conditions': 'Umgebungsbedingungen', 'Ambient Temperature': 'Aussentemperatur', 'Average Speed': 'Durchschnittsgeschwindigkeit', 'Wind Conditions': 'Windbedingungen', 'No Wind': 'Kein Wind', 'Terrain': 'Gelande', 'Driving Style': 'Fahrstil', 'Passengers': 'Passagiere', 'Battery Health': 'Batteriezustand', 'Search brand, model...': 'Marke, Modell suchen...', 'Brands': 'Marken', 'Filters': 'Filter', 'Clear': 'Loschen', 'Range': 'Reichweite', 'Starting from': 'Ab', 'Discontinued': 'Eingestellt', 'Compare Vehicles': 'Fahrzeuge vergleichen', 'No vehicles selected': 'Keine Fahrzeuge ausgewahlt', 'Clear All': 'Alle loschen', 'Loading specifications...': 'Spezifikationen werden geladen...' },
  hu: { 'Range Calculator': 'Hatotav kalkulator', 'SELECT VEHICLE': 'JARMU KIVALASZTASA', 'Choose a vehicle': 'Jarmu kivalasztasa', 'Environmental Conditions': 'Kornyezeti feltetelek', 'Ambient Temperature': 'Kulso homerseklet', 'Average Speed': 'Atlagsebesseg', 'Wind Conditions': 'Szelerosseg', 'No Wind': 'Nincs szel', 'Terrain': 'Terep', 'Driving Style': 'Vezetesi stilus', 'Passengers': 'Utasok', 'Battery Health': 'Akkumulator allapota', 'Search brand, model...': 'Marka, modell keresese...', 'Brands': 'Markak', 'Filters': 'Szurok', 'Clear': 'Torles', 'Range': 'Hatotav', 'Starting from': 'Kezdoar', 'Discontinued': 'Megszunt', 'Compare Vehicles': 'Jarmuvek osszehasonlitasa', 'No vehicles selected': 'Nincs kivalasztott jarmu', 'Clear All': 'Osszes torlese', 'Loading specifications...': 'Specifikaciok betoltese...' },
}

const calculatorTranslations: Record<Language, Record<string, string>> = {
  en: {},
  ro: {
    'Range Calculator': 'Calculator autonomie', 'SELECT VEHICLE': 'SELECTEAZĂ VEHICUL', 'Choose a vehicle': 'Alege un vehicul', 'Environmental Conditions': 'Condiții de mediu', 'Ambient Temperature': 'Temperatura exterioară', 'Average Speed': 'Viteza medie', 'Wind Conditions': 'Condiții de vânt', 'No Wind': 'Fără vânt', 'Tailwind': 'Vânt din spate', 'Light Headwind': 'Vânt frontal ușor', 'Strong Headwind': 'Vânt frontal puternic', 'Terrain': 'Teren', 'Flat': 'Plat', 'Hilly': 'Deluros', 'Mountain': 'Muntos', 'Driving Style & Load': 'Stil de condus și încărcătură', 'Driving Style': 'Stil de condus', 'Normal': 'Normal', 'Highway': 'Autostradă', 'Sport': 'Sport', 'Climate Control (HVAC)': 'Control climatizare (HVAC)', 'Off': 'Oprit', 'Heat': 'Încălzire', 'A/C': 'Aer condiționat', 'Cargo Load': 'Încărcătură', 'Battery & Trip Planning': 'Baterie și planificarea călătoriei', 'Battery State of Health': 'Starea de sănătate a bateriei', 'Trip Distance (optional)': 'Distanța călătoriei (opțional)', 'Enter trip distance in km...': 'Introdu distanța în km...', 'Reset all settings': 'Resetează toate setările', 'Select a vehicle': 'Selectează un vehicul', 'Estimated Real-World Range': 'Autonomie estimată în condiții reale', 'Consumption': 'Consum', 'vs WLTP': 'față de WLTP', 'Factor Breakdown': 'Analiza factorilor', 'Temperature': 'Temperatură', 'Speed': 'Viteză', 'Passengers & Cargo': 'Pasageri și încărcătură', 'Battery Health': 'Starea bateriei', 'Combined Factor': 'Factor combinat',
    'Battery': 'Baterie', 'Efficiency': 'Eficiență', 'Wind': 'Vânt', 'None': 'Fără', 'Light (~20 kg)': 'Ușor (~20 kg)', 'Medium (~75 kg)': 'Mediu (~75 kg)', 'Heavy (~150 kg)': 'Greu (~150 kg)',
    'New = 100% • After 3 yrs ~90% • After 8 yrs ~80%': 'Nouă = 100% • După 3 ani ~90% • După 8 ani ~80%',
    'Choose a car from the dropdown to see your estimated real-world range.': 'Alege un vehicul din listă pentru a vedea autonomia estimată în condiții reale.',
    'of WLTP': 'din WLTP', 'Trip': 'Călătorie', 'No charging needed!': 'Nu este necesară încărcarea!', 'Estimated': 'Estimat', 'battery remaining on arrival.': 'baterie rămasă la sosire.',
    'Charging Stops': 'Opriri pentru încărcare', 'Est. Charging Time': 'Timp estimat de încărcare', 'Based on 150 kW fast charging, 20→80% per stop.': 'Bazat pe încărcare rapidă de 150 kW, 20→80% la fiecare oprire.',
    'Estimates are based on scientific EV efficiency models. Actual range varies by individual driving patterns, vehicle age, and local conditions.': 'Estimările se bazează pe modele științifice de eficiență EV. Autonomia reală variază în funcție de stilul de condus, vechimea vehiculului și condițiile locale.',
  },
  de: {
    'Range Calculator': 'Reichweitenrechner', 'SELECT VEHICLE': 'FAHRZEUG AUSWÄHLEN', 'Choose a vehicle': 'Fahrzeug auswählen', 'Environmental Conditions': 'Umgebungsbedingungen', 'Ambient Temperature': 'Außentemperatur', 'Average Speed': 'Durchschnittsgeschwindigkeit', 'Wind Conditions': 'Windbedingungen', 'No Wind': 'Kein Wind', 'Tailwind': 'Rückenwind', 'Light Headwind': 'Leichter Gegenwind', 'Strong Headwind': 'Starker Gegenwind', 'Terrain': 'Gelände', 'Flat': 'Flach', 'Hilly': 'Hügelig', 'Mountain': 'Bergig', 'Driving Style & Load': 'Fahrstil und Beladung', 'Driving Style': 'Fahrstil', 'Normal': 'Normal', 'Highway': 'Autobahn', 'Sport': 'Sport', 'Climate Control (HVAC)': 'Klimatisierung (HVAC)', 'Off': 'Aus', 'Heat': 'Heizung', 'A/C': 'Klimaanlage', 'Cargo Load': 'Zuladung', 'Battery & Trip Planning': 'Batterie und Fahrtenplanung', 'Battery State of Health': 'Batteriezustand', 'Trip Distance (optional)': 'Fahrstrecke (optional)', 'Enter trip distance in km...': 'Fahrstrecke in km eingeben...', 'Reset all settings': 'Alle Einstellungen zurücksetzen', 'Select a vehicle': 'Fahrzeug auswählen', 'Estimated Real-World Range': 'Geschätzte reale Reichweite', 'Consumption': 'Verbrauch', 'vs WLTP': 'ggü. WLTP', 'Factor Breakdown': 'Faktorenübersicht', 'Temperature': 'Temperatur', 'Speed': 'Geschwindigkeit', 'Passengers & Cargo': 'Passagiere und Gepäck', 'Battery Health': 'Batteriezustand', 'Combined Factor': 'Gesamtfaktor',
    'Battery': 'Batterie', 'Efficiency': 'Effizienz', 'Wind': 'Wind', 'None': 'Keine', 'Light (~20 kg)': 'Leicht (~20 kg)', 'Medium (~75 kg)': 'Mittel (~75 kg)', 'Heavy (~150 kg)': 'Schwer (~150 kg)',
    'New = 100% • After 3 yrs ~90% • After 8 yrs ~80%': 'Neu = 100% • Nach 3 Jahren ~90% • Nach 8 Jahren ~80%',
    'Choose a car from the dropdown to see your estimated real-world range.': 'Wählen Sie ein Fahrzeug aus der Liste, um die geschätzte reale Reichweite zu sehen.',
    'of WLTP': 'des WLTP', 'Trip': 'Fahrt', 'No charging needed!': 'Kein Laden erforderlich!', 'Estimated': 'Geschätzt', 'battery remaining on arrival.': 'Batterie bei Ankunft verbleiben.',
    'Charging Stops': 'Ladestopps', 'Est. Charging Time': 'Geschätzte Ladezeit', 'Based on 150 kW fast charging, 20→80% per stop.': 'Basiert auf 150-kW-Schnellladen, 20→80% pro Stopp.',
    'Estimates are based on scientific EV efficiency models. Actual range varies by individual driving patterns, vehicle age, and local conditions.': 'Die Schätzungen basieren auf wissenschaftlichen EV-Effizienzmodellen. Die tatsächliche Reichweite hängt von Fahrweise, Fahrzeugalter und örtlichen Bedingungen ab.',
  },
  hu: {
    'Range Calculator': 'Hatótáv-kalkulátor', 'SELECT VEHICLE': 'JÁRMŰ KIVÁLASZTÁSA', 'Choose a vehicle': 'Jármű kiválasztása', 'Environmental Conditions': 'Környezeti feltételek', 'Ambient Temperature': 'Külső hőmérséklet', 'Average Speed': 'Átlagsebesség', 'Wind Conditions': 'Szélviszonyok', 'No Wind': 'Nincs szél', 'Tailwind': 'Hátszél', 'Light Headwind': 'Enyhe ellenszél', 'Strong Headwind': 'Erős ellenszél', 'Terrain': 'Terep', 'Flat': 'Sík', 'Hilly': 'Dombos', 'Mountain': 'Hegyi', 'Driving Style & Load': 'Vezetési stílus és terhelés', 'Driving Style': 'Vezetési stílus', 'Normal': 'Normál', 'Highway': 'Autópálya', 'Sport': 'Sport', 'Climate Control (HVAC)': 'Klímavezérlés (HVAC)', 'Off': 'Kikapcsolva', 'Heat': 'Fűtés', 'A/C': 'Légkondicionálás', 'Cargo Load': 'Rakomány', 'Battery & Trip Planning': 'Akkumulátor és útvonaltervezés', 'Battery State of Health': 'Akkumulátor állapota', 'Trip Distance (optional)': 'Utazási távolság (opcionális)', 'Enter trip distance in km...': 'Adja meg a távolságot km-ben...', 'Reset all settings': 'Összes beállítás visszaállítása', 'Select a vehicle': 'Jármű kiválasztása', 'Estimated Real-World Range': 'Becsült valós hatótáv', 'Consumption': 'Fogyasztás', 'vs WLTP': 'a WLTP-hez képest', 'Factor Breakdown': 'Tényezők bontása', 'Temperature': 'Hőmérséklet', 'Speed': 'Sebesség', 'Passengers & Cargo': 'Utasok és rakomány', 'Battery Health': 'Akkumulátor állapota', 'Combined Factor': 'Összesített tényező',
    'Battery': 'Akkumulátor', 'Efficiency': 'Hatékonyság', 'Wind': 'Szél', 'None': 'Nincs', 'Light (~20 kg)': 'Könnyű (~20 kg)', 'Medium (~75 kg)': 'Közepes (~75 kg)', 'Heavy (~150 kg)': 'Nehéz (~150 kg)',
    'New = 100% • After 3 yrs ~90% • After 8 yrs ~80%': 'Új = 100% • 3 év után ~90% • 8 év után ~80%',
    'Choose a car from the dropdown to see your estimated real-world range.': 'Válasszon járművet a listából a becsült valós hatótáv megtekintéséhez.',
    'of WLTP': 'a WLTP-értékből', 'Trip': 'Utazás', 'No charging needed!': 'Nincs szükség töltésre!', 'Estimated': 'Becsült', 'battery remaining on arrival.': 'akkumulátortöltöttség marad érkezéskor.',
    'Charging Stops': 'Töltési megállók', 'Est. Charging Time': 'Becsült töltési idő', 'Based on 150 kW fast charging, 20→80% per stop.': '150 kW-os gyorstöltés alapján, megállónként 20→80%.',
    'Estimates are based on scientific EV efficiency models. Actual range varies by individual driving patterns, vehicle age, and local conditions.': 'A becslések tudományos EV-hatékonysági modelleken alapulnak. A valós hatótáv a vezetési stílustól, a jármű korától és a helyi körülményektől függ.',
  },
}

type TranslationKey = keyof (typeof translations)['ro']

const featureTranslations: Record<Language, Record<string, string>> = {
  en: {},
  ro: { 'Explore': 'Explorează', 'Documentation': 'Documentație', 'List view': 'Vizualizare listă', 'Grid view': 'Vizualizare grilă', 'Vehicles per page': 'Vehicule pe pagină', 'Search brand, model...': 'Caută marcă, model...', 'Default order': 'Ordine implicită', 'Range: High to Low': 'Autonomie: mare la mică', 'Range: Low to High': 'Autonomie: mică la mare', 'Price: Low to High': 'Preț: mic la mare', 'Price: High to Low': 'Preț: mare la mic', 'Battery: High to Low': 'Baterie: mare la mică', 'Name: A to Z': 'Nume: A la Z', 'Brands': 'Mărci', 'Clear': 'Șterge', 'Max Price': 'Preț maxim', 'Min Range': 'Autonomie minimă', 'Drive Type': 'Tip tracțiune', 'Loading...': 'Se încarcă...', 'Explore tools': 'Explorează instrumentele', 'Plan, compare, and calculate': 'Planifică, compară și calculează', 'Compare EVs': 'Compară EV-uri', 'Compare range, price, and battery data.': 'Compară autonomia, prețul și datele bateriei.', 'Model real-world range conditions.': 'Modelează condițiile reale de autonomie.', 'Plan energy use and charging stops.': 'Planifică energia și opririle pentru încărcare.', 'Open Compare EVs': 'Deschide comparația EV', 'Open Range Calculator': 'Deschide calculatorul de autonomie', 'Open Engineering Lab': 'Deschide laboratorul de inginerie' },
  de: { 'Explore': 'Entdecken', 'Documentation': 'Dokumentation', 'List view': 'Listenansicht', 'Grid view': 'Rasteransicht', 'Vehicles per page': 'Fahrzeuge pro Seite', 'Explore tools': 'Werkzeuge entdecken', 'Plan, compare, and calculate': 'Planen, vergleichen und berechnen', 'Compare EVs': 'EVs vergleichen', 'Compare range, price, and battery data.': 'Reichweite, Preis und Batteriedaten vergleichen.', 'Model real-world range conditions.': 'Reale Reichweitenbedingungen modellieren.', 'Plan energy use and charging stops.': 'Energieverbrauch und Ladestopps planen.', 'Open Compare EVs': 'EV-Vergleich öffnen', 'Open Range Calculator': 'Reichweitenrechner öffnen', 'Open Engineering Lab': 'Techniklabor öffnen' },
  hu: { 'Explore': 'Felfedezés', 'Documentation': 'Dokumentáció', 'List view': 'Listanézet', 'Grid view': 'Rácsnézet', 'Vehicles per page': 'Jármű oldalanként', 'Explore tools': 'Eszközök felfedezése', 'Plan, compare, and calculate': 'Tervezzen, hasonlítson össze és számoljon', 'Compare EVs': 'EV-k összehasonlítása', 'Compare range, price, and battery data.': 'Hasonlítsa össze a hatótávot, árat és akkumulátoradatokat.', 'Model real-world range conditions.': 'Valós hatótávviszonyok modellezése.', 'Plan energy use and charging stops.': 'Tervezze meg az energiahasználatot és a töltési megállókat.', 'Open Compare EVs': 'EV-összehasonlítás megnyitása', 'Open Range Calculator': 'Hatótáv-kalkulátor megnyitása', 'Open Engineering Lab': 'Mérnöki labor megnyitása' },
}

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
  translateSpecification: (value: string) => string
  translateText: (value: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ro')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  function translateSpecification(value: string): string {
    const exact = specificationTranslations[language][value]
    if (exact) return exact
    const chargingTime = specificationTranslations[language]['Charging Time'] ?? 'Charging Time'
    const withChargingTime = value.startsWith('Charging Time') ? value.replace('Charging Time', chargingTime) : value
    return Object.entries(technicalValueTranslations[language])
      .sort(([left], [right]) => right.length - left.length)
      .reduce((translated, [source, target]) => translated.split(source).join(target), withChargingTime)
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t: key => translations[language][key], translateSpecification, translateText: value => featureTranslations[language][value] ?? calculatorTranslations[language][value] ?? interfaceTranslations[language][value] ?? (value === 'Price' ? { ro: 'Preț', en: 'Price', de: 'Preis', hu: 'Ár' }[language] : value) }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}

const technicalValueTranslations: Record<Language, Record<string, string>> = {
  en: {},
  ro: { 'Maximum Cargo Space': 'Spațiu maxim pentru bagaje', 'Driving Assistant Professional': 'Asistent profesional de conducere', 'Air Suspension': 'Suspensie pneumatică', 'Panoramic Sky Lounge': 'Plafon panoramic Sky Lounge', seconds: 'secunde', minutes: 'minute', hours: 'ore', miles: 'mile', 'Lithium Ion': 'Litiu-ion', Standard: 'Standard', Optional: 'Opțional', Available: 'Disponibil', Yes: 'Da', No: 'Nu' },
  de: { 'Maximum Cargo Space': 'Maximaler Laderaum', 'Driving Assistant Professional': 'Professioneller Fahrassistent', 'Air Suspension': 'Luftfederung', 'Panoramic Sky Lounge': 'Panorama-Sky-Lounge', seconds: 'Sekunden', minutes: 'Minuten', hours: 'Stunden', miles: 'Meilen', 'Lithium Ion': 'Lithium-Ionen', Standard: 'Serienmäßig', Optional: 'Optional', Available: 'Verfügbar', Yes: 'Ja', No: 'Nein' },
  hu: { 'Maximum Cargo Space': 'Maximális csomagtér', 'Driving Assistant Professional': 'Professzionális vezetési asszisztens', 'Air Suspension': 'Légrugózás', 'Panoramic Sky Lounge': 'Panorámás Sky Lounge', seconds: 'másodperc', minutes: 'perc', hours: 'óra', miles: 'mérföld', 'Lithium Ion': 'Lítiumion', Standard: 'Alapfelszereltség', Optional: 'Opcionális', Available: 'Elérhető', Yes: 'Igen', No: 'Nem' },
}