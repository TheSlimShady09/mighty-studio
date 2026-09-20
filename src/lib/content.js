import marryMe from '../assets/portfolio/marry-me.jpg';
import stageLight from '../assets/portfolio/stage-light.jpg';
import arena from '../assets/portfolio/arena.jpg';
import goldenHour from '../assets/portfolio/golden-hour.jpg';
import encore from '../assets/portfolio/encore.jpg';
import spotlight from '../assets/portfolio/spotlight.jpg';

/**
 * All copy, in both languages.
 *
 * Single strings live in UI[lang]. Anything that is a list with its own image,
 * key or order keeps that data once and carries `en` / `sq` objects alongside,
 * so a photograph can never drift away from its caption.
 */

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'sq', label: 'SQ', name: 'Shqip' }
];

export const UI = {
  en: {
    nav: {
      studio: 'Studio',
      work: 'Work',
      portfolio: 'Portfolio',
      services: 'Services',
      contact: 'Contact',
      cta: 'Enquire',
      menu: 'Toggle menu',
      language: 'Language'
    },
    hero: {
      phrase: ['Some moments', 'deserve forever.'],
      phraseScript: 'forever',
      wordmark: 'Mighty Studio',
      tagline: 'Photography and Film',
      side: 'Durrës · Albania',
      disciplines: ['Weddings', 'Proposals', 'Events', 'Concerts'],
      since: 'Est. Durrës'
    },
    about: {
      eyebrow: 'The Studio',
      title: ['Images that hold', 'the day exactly', 'as it felt.'],
      lead: 'MIGHTY STUDIO is an independent photography and film practice working across weddings, proposals, events and live music.',
      body: 'On the day we work as a small team: a lead photographer, a second shooter and a filmmaker. Enough hands to miss nothing, few enough to stay out of your way.'
    },
    showcase: {
      eyebrow: 'What we photograph',
      title: 'Every kind of day',
      intro: 'From the quietest hour of a wedding morning to a concert stage.',
      hint: 'Swipe',
      label: 'What we photograph',
      tabs: 'Choose a discipline'
    },
    portfolio: {
      eyebrow: 'Portfolio',
      title: 'The archive',
      intro: 'Weddings, proposals and live music. Filter by discipline, or open any piece to see it in full.',
      filterLabel: 'Filter portfolio',
      view: 'View',
      open: 'Open',
      client: 'Client',
      discipline: 'Discipline',
      year: 'Year',
      close: 'Close',
      prev: 'Previous project',
      next: 'Next project'
    },
    services: { eyebrow: 'Services', title: ['Five disciplines,', 'one standard'] },
    process: { eyebrow: 'Process' },
    contact: {
      eyebrow: 'Contact',
      title: ['Begin a', 'commission.'],
      body: 'Tell us the date, the venue and what matters most to you. Every enquiry gets a reply from the studio within one working day.',
      address: 'Durrës, Albania. Studio visits by appointment.',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      project: 'Service',
      projectPlaceholder: 'Select a service',
      date: 'Date',
      datePlaceholder: 'Day of the event',
      place: 'Place',
      placePlaceholder: 'Venue, town',
      budget: 'Budget',
      budgetPlaceholder: 'Optional',
      brief: 'Brief',
      briefPlaceholder: 'Date, venue, and what you have in mind',
      send: 'Send enquiry',
      sending: 'Sending',
      transmitting: 'Sending…',
      checkFields: 'Check the highlighted fields',
      sentTitle: 'Over to WhatsApp.',
      sentBody: 'WhatsApp should have opened with your enquiry ready to send. If it did not, write to us directly on +355 69 292 1229.',
      sendAnother: 'Send another →',
      errName: 'Tell us your name',
      errEmail: 'A valid email, please',
      errType: 'Pick a service',
      errDate: 'Which day is it?',
      errMessage: 'A line or two about the day',
      bookingTitle: 'NEW BOOKING — MIGHTY STUDIO',
      bookingDetails: 'Details',
      bookingFrom: 'Sent from the Mighty Studio website'
    },
    footer: {
      blurb: 'Photography and film for weddings, events and the brands behind them. Based in Durrës, travelling for the rest.',
      index: 'Index',
      services: 'Services',
      copyright: 'Mighty Studio. All rights reserved.',
      legalLabel: 'Legal'
    }
  },

  sq: {
    nav: {
      studio: 'Studioja',
      work: 'Puna',
      portfolio: 'Portofoli',
      services: 'Shërbimet',
      contact: 'Kontakt',
      cta: 'Kontaktoni',
      menu: 'Hap menunë',
      language: 'Gjuha'
    },
    hero: {
      phrase: ['Disa momente', 'meritojnë përjetësi.'],
      phraseScript: 'përjetësi',
      wordmark: 'Mighty Studio',
      tagline: 'Fotografi dhe Film',
      side: 'Durrës · Shqipëri',
      disciplines: ['Dasma', 'Propozime', 'Evente', 'Koncerte'],
      since: 'Me bazë në Durrës'
    },
    about: {
      eyebrow: 'Studioja',
      title: ['Imazhe që e ruajnë', 'ditën ashtu', 'siç u ndje.'],
      lead: 'MIGHTY STUDIO është studio e pavarur e fotografisë dhe filmit, që punon me dasma, propozime, evente dhe muzikë live.',
      body: 'Në ditën e eventit punojmë si ekip i vogël: një fotograf kryesor, një i dytë dhe një filmues. Aq sa duhet për të mos humbur asgjë, dhe aq pak sa të mos ju zëmë rrugën.'
    },
    showcase: {
      eyebrow: 'Çfarë fotografojmë',
      title: 'Çdo lloj dite',
      intro: 'Nga ora më e qetë e mëngjesit të dasmës deri te skena e një koncerti.',
      hint: 'Rrëshqit',
      label: 'Çfarë fotografojmë',
      tabs: 'Zgjidh një fushë'
    },
    portfolio: {
      eyebrow: 'Portofoli',
      title: 'Arkivi',
      intro: 'Dasma, propozime dhe muzikë live. Filtro sipas fushës, ose hap secilën punë për ta parë të plotë.',
      filterLabel: 'Filtro portofolin',
      view: 'Shiko',
      open: 'Hap',
      client: 'Klienti',
      discipline: 'Fusha',
      year: 'Viti',
      close: 'Mbyll',
      prev: 'Puna e mëparshme',
      next: 'Puna tjetër'
    },
    services: { eyebrow: 'Shërbimet', title: ['Pesë fusha,', 'një standard'] },
    process: { eyebrow: 'Procesi' },
    contact: {
      eyebrow: 'Kontakt',
      title: ['Le të nisim', 'bashkëpunimin.'],
      body: 'Na tregoni datën, vendin dhe çfarë ka më shumë rëndësi për ju. Çdo kërkesë merr përgjigje nga studioja brenda një dite pune.',
      address: 'Durrës, Shqipëri. Vizitat në studio me takim paraprak.',
      name: 'Emri',
      namePlaceholder: 'Emri juaj',
      email: 'Email',
      emailPlaceholder: 'ju@shembull.com',
      project: 'Shërbimi',
      projectPlaceholder: 'Zgjidhni një shërbim',
      date: 'Data',
      datePlaceholder: 'Dita e eventit',
      place: 'Vendi',
      placePlaceholder: 'Ambienti, qyteti',
      budget: 'Buxheti',
      budgetPlaceholder: 'Opsionale',
      brief: 'Përshkrimi',
      briefPlaceholder: 'Data, vendi dhe çfarë keni në mendje',
      send: 'Dërgo kërkesën',
      sending: 'Po dërgohet',
      transmitting: 'Po dërgohet…',
      checkFields: 'Kontrolloni fushat e shënuara',
      sentTitle: 'Vazhdoni në WhatsApp.',
      sentBody: 'WhatsApp duhet të jetë hapur me kërkesën tuaj gati për dërgim. Nëse jo, na shkruani direkt në +355 69 292 1229.',
      sendAnother: 'Dërgo një tjetër →',
      errName: 'Na tregoni emrin tuaj',
      errEmail: 'Një email i vlefshëm, ju lutem',
      errType: 'Zgjidhni një shërbim',
      errDate: 'Cilën ditë e keni?',
      errMessage: 'Dy fjalë për ditën tuaj',
      bookingTitle: 'REZERVIM I RI — MIGHTY STUDIO',
      bookingDetails: 'Detajet',
      bookingFrom: 'Dërguar nga faqja e Mighty Studio'
    },
    footer: {
      blurb: 'Fotografi dhe film për dasma, evente dhe brendet pas tyre. Me bazë në Durrës, dhe udhëtojmë për pjesën tjetër.',
      index: 'Faqet',
      services: 'Shërbimet',
      copyright: 'Mighty Studio. Të gjitha të drejtat e rezervuara.',
      legalLabel: 'Ligjore'
    }
  }
};

export const NAV_LINKS = [
  { href: '#about', key: 'studio' },
  { href: '#work', key: 'work' },
  { href: '#portfolio', key: 'portfolio' },
  { href: '#services', key: 'services' },
  { href: '#contact', key: 'contact' }
];

export const MARQUEE = {
  en: ['Weddings', 'Proposals', 'Engagements', 'Events', 'Concerts', 'Branding', 'Social Media'],
  sq: ['Dasma', 'Propozime', 'Fejesa', 'Evente', 'Koncerte', 'Branding', 'Rrjete Sociale']
};

/** What each discipline actually includes. */
export const ABOUT_SPECS = [
  {
    id: 'photography',
    en: {
      title: 'Photography',
      items: [
        'Coverage of the full day, from preparation to the last dance',
        'Two photographers on every wedding',
        'Medium format and 35mm film alongside digital',
        'Every selected frame edited in colour and in black and white',
        'Online gallery within three weeks; prints and albums on request'
      ]
    },
    sq: {
      title: 'Fotografi',
      items: [
        'Mbulim i gjithë ditës, nga përgatitja deri te vallja e fundit',
        'Dy fotografë në çdo dasmë',
        'Format i mesëm dhe film 35mm krahas digjitales',
        'Çdo foto e përzgjedhur, e redaktuar me ngjyra dhe bardhë e zi',
        'Galeria online brenda tri javësh; printime dhe albume me kërkesë'
      ]
    }
  },
  {
    id: 'videography',
    en: {
      title: 'Videography',
      items: [
        'A highlight film of four to six minutes',
        'Ceremony and speeches in full, uncut',
        '6K capture, with drone coverage where the venue permits',
        'Clean audio from lapel microphones and the sound desk',
        'Vertical cuts for social, delivered first'
      ]
    },
    sq: {
      title: 'Videografi',
      items: [
        'Një film përmbledhës katër deri gjashtë minuta',
        'Ceremonia dhe fjalimet të plota, pa prerje',
        'Xhirim 6K, me dron aty ku ambienti e lejon',
        'Audio e pastër nga mikrofonat dhe miksheri',
        'Versione vertikale për rrjetet, të dorëzuara të parat'
      ]
    }
  }
];

export const STATS = [
  { value: 5, en: 'Years of practice', sq: 'Vite praktikë' },
  { value: 380, suffix: '+', en: 'Productions delivered', sq: 'Produksione të dorëzuara' },
  { value: 9, en: 'Awards', sq: 'Çmime' },
  { value: 6, en: 'Countries delivered', sq: 'Shtete të mbuluara' }
];

/** The slideshow, each slide carrying a real frame from the archive. */
export const SHOWCASE = [
  {
    id: 'weddings',
    src: goldenHour,
    en: {
      name: 'Weddings',
      desc: 'Full-day coverage, from the first quiet hour of the morning through to the last dance.',
      alt: 'A couple walking hand in hand through a vineyard towards a candlelit table at sunset.'
    },
    sq: {
      name: 'Dasma',
      desc: 'Mbulim i gjithë ditës, nga ora e parë e qetë e mëngjesit deri te vallja e fundit.',
      alt: 'Një çift që ecën dorë për dore mes vreshtit drejt një tryeze me qirinj në perëndim.'
    }
  },
  {
    id: 'proposals',
    src: marryMe,
    en: {
      name: 'Proposals',
      desc: 'The question itself, photographed from a distance so the moment stays yours alone.',
      alt: 'A couple kissing on the beach at dusk in front of illuminated MARRY ME letters.'
    },
    sq: {
      name: 'Propozime',
      desc: 'Vetë pyetja, e fotografuar nga larg, që momenti të mbetet vetëm i juaji.',
      alt: 'Një çift që puthet në plazh në muzg para shkronjave të ndriçuara MARRY ME.'
    }
  },
  {
    id: 'concerts',
    src: arena,
    en: {
      name: 'Concerts',
      desc: 'Stage, crowd and the light between them, shot fast and delivered the same night.',
      alt: 'A performer on a stage monitor with both arms raised above a full arena crowd.'
    },
    sq: {
      name: 'Koncerte',
      desc: 'Skena, publiku dhe drita mes tyre, të xhiruara shpejt dhe të dorëzuara po atë natë.',
      alt: 'Një artist mbi monitorin e skenës me të dy krahët lart, para një arene plot publik.'
    }
  },
  {
    id: 'events',
    src: encore,
    en: {
      name: 'Events',
      desc: 'Galas, launches and private celebrations, documented as they happen and delivered fast.',
      alt: 'A singer with arms outstretched in front of a large projected backdrop, band either side.'
    },
    sq: {
      name: 'Evente',
      desc: 'Gala, lansime dhe festa private, të dokumentuara ndërsa ndodhin dhe të dorëzuara shpejt.',
      alt: 'Një këngëtar me krahë të hapur para një sfondi të madh të projektuar, me bendin anash.'
    }
  },
  {
    id: 'social',
    src: spotlight,
    en: {
      name: 'Social Media',
      desc: 'Vertical film and stills cut for the feed, made to sit alongside the rest of the work.',
      alt: 'A singer in a blue suit crouched on a stage monitor, microphone held close.'
    },
    sq: {
      name: 'Rrjete Sociale',
      desc: 'Video dhe foto vertikale të prera për rrjetet, në të njëjtin nivel me pjesën tjetër.',
      alt: 'Një këngëtar me kostum blu i ulur mbi monitorin e skenës, me mikrofonin afër.'
    }
  }
];

export const PORTFOLIO_FILTERS = [
  { key: 'all', en: 'All', sq: 'Të gjitha' },
  { key: 'weddings', en: 'Weddings', sq: 'Dasma' },
  { key: 'proposals', en: 'Proposals', sq: 'Propozime' },
  { key: 'concerts', en: 'Concerts', sq: 'Koncerte' }
];

/** `size` drives the grid: 'tall' spans two rows, 'wide' spans two columns. */
export const PORTFOLIO = [
  {
    id: 'p01',
    category: 'proposals',
    src: marryMe,
    year: '2025',
    size: 'wide',
    en: {
      title: 'Marry Me',
      client: 'Private proposal',
      alt: 'A couple kissing at dusk on the beach in front of illuminated MARRY ME letters, candles and roses on the sand.'
    },
    sq: {
      title: 'Marry Me',
      client: 'Propozim privat',
      alt: 'Një çift që puthet në muzg në plazh para shkronjave të ndriçuara MARRY ME, me qirinj dhe trëndafila mbi rërë.'
    }
  },
  {
    id: 'p02',
    category: 'weddings',
    src: goldenHour,
    year: '2025',
    size: 'tall',
    en: {
      title: 'Golden Hour',
      client: 'Vineyard reception',
      alt: 'A couple in cream linen walking hand in hand down a vineyard row towards a long candlelit table at sunset.'
    },
    sq: {
      title: 'Golden Hour',
      client: 'Pritje në vresht',
      alt: 'Një çift me rroba liri krem që ecin dorë për dore mes rreshtave të vreshtit drejt një tryeze të gjatë me qirinj.'
    }
  },
  {
    id: 'p03',
    category: 'concerts',
    src: stageLight,
    year: '2025',
    size: '',
    en: {
      title: 'Stage Light',
      client: 'Live concert',
      alt: 'A singer in a pale pink suit turning to the camera mid-song, lit from behind against a deep red stage.'
    },
    sq: {
      title: 'Stage Light',
      client: 'Koncert live',
      alt: 'Një këngëtare me kostum rozë të çelët që kthehet nga kamera gjatë këngës, e ndriçuar nga pas.'
    }
  },
  {
    id: 'p04',
    category: 'concerts',
    src: arena,
    year: '2025',
    size: 'tall',
    en: {
      title: 'Arena',
      client: 'Live concert',
      alt: 'A performer standing on a stage monitor with both arms raised above a full arena crowd.'
    },
    sq: {
      title: 'Arena',
      client: 'Koncert live',
      alt: 'Një artist në këmbë mbi monitorin e skenës me të dy krahët lart, përpara një arene plot me publik.'
    }
  },
  {
    id: 'p05',
    category: 'concerts',
    src: encore,
    year: '2024',
    size: '',
    en: {
      title: 'Encore',
      client: 'Live concert',
      alt: 'A singer with arms outstretched in front of a giant projected backdrop, band playing either side.'
    },
    sq: {
      title: 'Encore',
      client: 'Koncert live',
      alt: 'Një këngëtar me krahë të hapur para një sfondi gjigant të projektuar, me bendin në të dy anët.'
    }
  },
  {
    id: 'p06',
    category: 'concerts',
    src: spotlight,
    year: '2024',
    size: '',
    en: {
      title: 'Spotlight',
      client: 'Live concert',
      alt: 'A singer in a blue suit crouched on a stage monitor, holding the microphone close.'
    },
    sq: {
      title: 'Spotlight',
      client: 'Koncert live',
      alt: 'Një këngëtar me kostum blu i ulur mbi monitorin e skenës, me mikrofonin afër fytyrës.'
    }
  }
];

export const SERVICES = [
  {
    id: 'photography',
    en: {
      name: 'Photography',
      desc: 'Weddings, proposals, engagements and events. Two photographers, medium format and 35mm film alongside digital, and a finished gallery within three weeks.',
      tags: ['Weddings', 'Proposals', 'Events']
    },
    sq: {
      name: 'Fotografi',
      desc: 'Dasma, propozime, fejesa dhe evente. Dy fotografë, format i mesëm dhe film 35mm krahas digjitales, dhe galeria e përfunduar brenda tri javësh.',
      tags: ['Dasma', 'Propozime', 'Evente']
    }
  },
  {
    id: 'videography',
    en: {
      name: 'Videography',
      desc: 'A highlight film, the ceremony and speeches in full, 6K capture and clean audio. Drone where the venue permits, and vertical cuts for social.',
      tags: ['Highlight film', 'Ceremony', 'Drone']
    },
    sq: {
      name: 'Videografi',
      desc: 'Një film përmbledhës, ceremonia dhe fjalimet të plota, xhirim 6K dhe audio e pastër. Dron aty ku ambienti e lejon, dhe versione vertikale për rrjetet.',
      tags: ['Film përmbledhës', 'Ceremoni', 'Dron']
    }
  },
  {
    id: 'direction',
    en: {
      name: 'Direction',
      desc: 'Planning the day frame by frame: timings, locations, light and a running order agreed with you and your planner before anything is booked.',
      tags: ['Planning', 'Locations', 'Timings']
    },
    sq: {
      name: 'Regji',
      desc: 'Planifikimi i ditës kuadër pas kuadri: oraret, lokacionet, drita dhe radha e ngjarjeve, të rëna dakord me ju dhe planifikuesin.',
      tags: ['Planifikim', 'Lokacione', 'Orare']
    }
  },
  {
    id: 'post',
    en: {
      name: 'Post & Grade',
      desc: 'Retouching, edit, colour and black-and-white grade. Everything leaves calibrated and versioned for print, for web and for social.',
      tags: ['Retouch', 'Edit', 'Colour']
    },
    sq: {
      name: 'Post-Produksion',
      desc: 'Retush, montazh dhe korrigjim ngjyrash e bardhë-zi. Gjithçka del e kalibruar dhe e përgatitur për print, për web dhe për rrjetet.',
      tags: ['Retush', 'Montazh', 'Ngjyra']
    }
  },
  {
    id: 'studio',
    en: {
      name: 'Studio Hire',
      desc: 'Two blacked-out stages with a nine-metre cyclorama, a full grip and lighting package, and a resident crew to support visiting productions.',
      tags: ['Stages', 'Lighting', 'Crew']
    },
    sq: {
      name: 'Studio me qira',
      desc: 'Dy salla të errësuara me cikloramë nëntë metra, pajisje të plota drite dhe grip, dhe ekip rezident për produksionet vizitore.',
      tags: ['Salla', 'Ndriçim', 'Ekip']
    }
  }
];

export const PROCESS = [
  {
    step: '01',
    en: {
      title: 'Brief',
      body: 'A conversation about the day: the date, the venue, the people, and what you most want to remember.'
    },
    sq: {
      title: 'Takimi',
      body: 'Një bisedë për ditën tuaj: data, vendi, njerëzit dhe çfarë doni të mbani mend më shumë.'
    }
  },
  {
    step: '02',
    en: {
      title: 'Pre-light',
      body: 'We visit the venue ahead of time, test the light, and agree a running order with you and your planner.'
    },
    sq: {
      title: 'Përgatitja',
      body: 'Vizitojmë vendin paraprakisht, testojmë dritën dhe caktojmë radhën e ngjarjeve me ju dhe planifikuesin.'
    }
  },
  {
    step: '03',
    en: {
      title: 'The day',
      body: 'A small team, working quietly. You will barely notice us, and nothing that matters goes unphotographed.'
    },
    sq: {
      title: 'Dita',
      body: 'Ekip i vogël, që punon në heshtje. Pothuajse nuk do të na vini re, dhe asgjë me rëndësi nuk mbetet pa u fotografuar.'
    }
  },
  {
    step: '04',
    en: {
      title: 'Delivery',
      body: 'A first look within days, the full gallery in three weeks, and the film once the grade and audio are right.'
    },
    sq: {
      title: 'Dorëzimi',
      body: 'Një pamje e parë brenda pak ditësh, galeria e plotë për tri javë, dhe filmi kur ngjyra dhe audio të jenë gati.'
    }
  }
];

export const PROJECT_TYPES = [
  { value: 'wedding', en: 'Wedding', sq: 'Dasmë' },
  { value: 'proposal', en: 'Proposal', sq: 'Propozim' },
  { value: 'engagement', en: 'Engagement', sq: 'Fejesë' },
  { value: 'event', en: 'Event or concert', sq: 'Event ose koncert' },
  { value: 'branding', en: 'Branding or social', sq: 'Branding ose rrjete' },
  { value: 'other', en: 'Something else', sq: 'Diçka tjetër' }
];

export const BUDGETS = [
  { value: 'lt1', en: 'Under €1,000', sq: 'Nën 1.000 €' },
  { value: '1-3', en: '€1,000 to €3,000', sq: '1.000 € deri 3.000 €' },
  { value: '3-6', en: '€3,000 to €6,000', sq: '3.000 € deri 6.000 €' },
  { value: 'gt6', en: 'Above €6,000', sq: 'Mbi 6.000 €' }
];

export const FOOTER_SERVICES = [
  { href: '#work', en: 'Weddings', sq: 'Dasma' },
  { href: '#work', en: 'Proposals', sq: 'Propozime' },
  { href: '#work', en: 'Engagements', sq: 'Fejesa' },
  { href: '#work', en: 'Events', sq: 'Evente' },
  { href: '#work', en: 'Concerts', sq: 'Koncerte' },
  { href: '#services', en: 'Studio hire', sq: 'Studio me qira' }
];

export const FOOTER_LEGAL = [
  { href: '#contact', en: 'Privacy', sq: 'Privatësia' },
  { href: '#contact', en: 'Terms', sq: 'Kushtet' },
  { href: '#contact', en: 'Cookies', sq: 'Cookies' }
];

export const FOOTER_SOCIAL = [
  { icon: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/mighty_studioo/' },
  { icon: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61556569860655' },
  { icon: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/355692921229' },
  { icon: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@mighty_studioo' }
];
