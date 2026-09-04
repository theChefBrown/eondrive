import { useEffect, useRef, useState } from 'react'
import { BookOpen, Calculator, Database, FlaskConical, Languages, SlidersHorizontal, X } from 'lucide-react'
import { useLanguage, type Language } from '../context/LanguageContext'

type Chapter = 'database' | 'compare' | 'calculator' | 'lab'

const copy: Record<Language, { title: string; subtitle: string; chapters: Record<Chapter, { label: string; title: string; body: string; points: string[] }> }> = {
  en: {
    title: 'Eondrive Guidebook', subtitle: 'A practical map of the EV database and planning tools.',
    chapters: {
      database: { label: 'EV Database', title: 'Explore the vehicle catalog', body: 'Browse local, optimized vehicle records without external image requests.', points: ['Search by brand, model, or description.', 'Filter by brand, price, range, and drive type.', 'Choose Grid or List View and set 25, 35, or 50 vehicles per page.'] },
      compare: { label: 'Compare', title: 'Compare what matters', body: 'Select up to four vehicles from the catalog for a focused comparison.', points: ['Compare range, battery capacity, efficiency, price, and model year.', 'Open the detailed specification table when more context is needed.', 'Choose trims to compare the configuration you actually want.'] },
      calculator: { label: 'Range Calculator', title: 'Estimate real-world range', body: 'Model the effect of weather, speed, terrain, loading, and battery health.', points: ['Start with an EV from the catalog.', 'Adjust conditions to see their combined impact.', 'Use trip planning to estimate charging stops and time.'] },
      lab: { label: 'Engineering Lab', title: 'Plan a journey with inputs', body: 'Use a transparent engineering estimate for energy use and charging.', points: ['Set distance, temperature, speed, passengers, and cargo.', 'Define the starting charge, reserve, and charger power.', 'Review the assumptions behind each calculation.'] },
    },
  },
  ro: {
    title: 'Ghid Eondrive', subtitle: 'O hartă practică a bazei de date EV și a instrumentelor de planificare.',
    chapters: {
      database: { label: 'Bază EV', title: 'Explorează catalogul de vehicule', body: 'Răsfoiește vehicule optimizate local, fără solicitări externe pentru imagini.', points: ['Caută după marcă, model sau descriere.', 'Filtrează după marcă, preț, autonomie și tracțiune.', 'Alege Vizualizare grilă sau listă și 25, 35 sau 50 de vehicule pe pagină.'] },
      compare: { label: 'Compară', title: 'Compară ce contează', body: 'Selectează până la patru vehicule pentru o comparație concentrată.', points: ['Compară autonomia, bateria, eficiența, prețul și anul modelului.', 'Deschide tabelul de specificații pentru mai multe detalii.', 'Alege versiunile potrivite pentru comparația dorită.'] },
      calculator: { label: 'Calculator autonomie', title: 'Estimează autonomia reală', body: 'Modelează efectul vremii, vitezei, terenului, încărcării și sănătății bateriei.', points: ['Începe cu un EV din catalog.', 'Ajustează condițiile pentru a vedea efectul lor combinat.', 'Folosește planificarea călătoriei pentru opriri și timp de încărcare.'] },
      lab: { label: 'Laborator de inginerie', title: 'Planifică o călătorie cu date', body: 'Folosește o estimare inginerească transparentă pentru energie și încărcare.', points: ['Setează distanța, temperatura, viteza, pasagerii și încărcătura.', 'Definește încărcarea inițială, rezerva și puterea încărcătorului.', 'Verifică ipotezele fiecărui calcul.'] },
    },
  },
  de: {
    title: 'Eondrive-Handbuch', subtitle: 'Ein praktischer Wegweiser durch die EV-Datenbank und Planungstools.',
    chapters: {
      database: { label: 'EV-Datenbank', title: 'Fahrzeugkatalog erkunden', body: 'Durchsuchen Sie lokal optimierte Fahrzeugdaten ohne externe Bildanfragen.', points: ['Suche nach Marke, Modell oder Beschreibung.', 'Filtern nach Marke, Preis, Reichweite und Antriebsart.', 'Raster- oder Listenansicht sowie 25, 35 oder 50 Fahrzeuge pro Seite wählen.'] },
      compare: { label: 'Vergleichen', title: 'Wichtiges vergleichen', body: 'Wählen Sie bis zu vier Fahrzeuge für einen gezielten Vergleich.', points: ['Reichweite, Batterie, Effizienz, Preis und Modelljahr vergleichen.', 'Bei Bedarf die detaillierte Spezifikationstabelle öffnen.', 'Ausstattungsvarianten passend zum Vergleich auswählen.'] },
      calculator: { label: 'Reichweitenrechner', title: 'Reale Reichweite schätzen', body: 'Modellieren Sie den Einfluss von Wetter, Geschwindigkeit, Gelände, Beladung und Batteriezustand.', points: ['Mit einem EV aus dem Katalog beginnen.', 'Bedingungen anpassen und den kombinierten Effekt sehen.', 'Fahrtplanung für Ladestopps und Ladezeit nutzen.'] },
      lab: { label: 'Techniklabor', title: 'Fahrt mit Eingaben planen', body: 'Nutzen Sie eine transparente technische Schätzung für Energie und Laden.', points: ['Distanz, Temperatur, Geschwindigkeit, Passagiere und Gepäck festlegen.', 'Startladung, Reserve und Ladeleistung definieren.', 'Die Annahmen hinter jeder Berechnung prüfen.'] },
    },
  },
  hu: {
    title: 'Eondrive útmutató', subtitle: 'Gyakorlati áttekintés az EV-adatbázishoz és a tervező eszközökhöz.',
    chapters: {
      database: { label: 'EV adatbázis', title: 'Fedezze fel a járműkatalógust', body: 'Böngésszen helyileg optimalizált járműadatok között külső képkérések nélkül.', points: ['Keressen márka, modell vagy leírás alapján.', 'Szűrjön márka, ár, hatótáv és hajtástípus szerint.', 'Válasszon rács- vagy listanézetet, valamint 25, 35 vagy 50 járművet oldalanként.'] },
      compare: { label: 'Összehasonlítás', title: 'Hasonlítsa össze a fontos adatokat', body: 'Válasszon ki legfeljebb négy járművet egy célzott összehasonlításhoz.', points: ['Hasonlítsa össze a hatótávot, akkumulátort, hatékonyságot, árat és modellévet.', 'Szükség esetén nyissa meg a részletes specifikációs táblázatot.', 'Válassza ki az összevetni kívánt változatokat.'] },
      calculator: { label: 'Hatótáv-kalkulátor', title: 'Becsülje meg a valós hatótávot', body: 'Modellezze az időjárás, sebesség, terep, terhelés és akkumulátorállapot hatását.', points: ['Kezdjen egy katalógusbeli EV-vel.', 'Állítsa be a feltételeket az együttes hatás megtekintéséhez.', 'Használja az útvonaltervezést töltési megállókhoz és időhöz.'] },
      lab: { label: 'Mérnöki labor', title: 'Tervezzen utazást adatokkal', body: 'Használjon átlátható mérnöki becslést az energiafelhasználáshoz és töltéshez.', points: ['Adja meg a távolságot, hőmérsékletet, sebességet, utasokat és rakományt.', 'Határozza meg a kezdő töltést, tartalékot és töltőteljesítményt.', 'Tekintse át az egyes számítások feltételezéseit.'] },
    },
  },
}

const chapters: { id: Chapter; icon: typeof Database }[] = [
  { id: 'database', icon: Database }, { id: 'compare', icon: SlidersHorizontal },
  { id: 'calculator', icon: Calculator }, { id: 'lab', icon: FlaskConical },
]

export default function DocumentationModal({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const [activeChapter, setActiveChapter] = useState<Chapter>('database')
  const overlayRef = useRef<HTMLDivElement>(null)
  const content = copy[language]
  const chapter = content.chapters[activeChapter]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="modal-overlay" ref={overlayRef} onMouseDown={event => event.target === overlayRef.current && onClose()} role="presentation">
      <section className="documentation-modal" role="dialog" aria-modal="true" aria-labelledby="documentation-title">
        <header className="documentation-header">
          <div className="flex items-center gap-3 min-w-0">
            <span className="documentation-mark"><BookOpen size={20} /></span>
            <div className="min-w-0"><h2 id="documentation-title">{content.title}</h2><p>{content.subtitle}</p></div>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close documentation"><X size={20} /></button>
        </header>
        <div className="documentation-body">
          <nav className="documentation-nav" aria-label="Documentation chapters">
            {chapters.map(({ id, icon: Icon }) => (
              <button key={id} className={activeChapter === id ? 'active' : ''} onClick={() => setActiveChapter(id)}>
                <Icon size={17} /><span>{content.chapters[id].label}</span>
              </button>
            ))}
          </nav>
          <article className="documentation-page" key={`${language}-${activeChapter}`}>
            <span className="documentation-kicker"><Languages size={14} /> Eondrive</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
            <ol>{chapter.points.map(point => <li key={point}>{point}</li>)}</ol>
          </article>
        </div>
      </section>
    </div>
  )
}