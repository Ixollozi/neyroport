export const site = {
  brand: "NeyroPort",
  phones: ["+998 71 200 00 00", "+998 90 000 00 00"],
  email: "office@neyroport.uz",
  address: {
    ru: "г. Ташкент — адрес уточняется у менеджера",
    uz: "Toshkent sh. — manzil menejerdan aniqlanadi",
  },
  social: {
    telegram: "https://t.me/neyroport",
    max: "https://max.ru/u/f9LHodD0cOJyqdX6q61gzwFpXqRI-FRHv9XQ7qaR4pCbtw2SecrWB0Ja7Pg",
    vk: "https://vk.com/neyroport",
    youtube: "https://www.youtube.com/channel/UC4FEf5GFR-yHWuHOr5FGR3Q",
  },
  priceFrom: "69900",
} as const;

export type DiseaseSlug =
  | "insult"
  | "vestibulyarnie-narusheniya"
  | "dtsp"
  | "demieliniziruyushchie-zabolevaniya"
  | "degenerativnye-zabolevaniya"
  | "rechevye-rasstroystva"
  | "sdvg"
  | "insomniya";

export const diseases: {
  slug: DiseaseSlug;
  href: string;
  ru: { title: string; short: string };
  uz: { title: string; short: string };
  tone: string;
}[] = [
  {
    slug: "insult",
    href: "/insult",
    ru: {
      title: "Инсульт",
      short:
        "Восстановление речи, координации и двигательных функций после ОНМК.",
    },
    uz: {
      title: "Insult",
      short: "ONMK dan keyin nutq, koordinatsiya va harakat funksiyalarini tiklash.",
    },
    tone: "#E8F1FF",
  },
  {
    slug: "vestibulyarnie-narusheniya",
    href: "/vestibulyarnie-narusheniya",
    ru: {
      title: "Вестибулярные нарушения",
      short: "Головокружение, неустойчивость, нарушение равновесия.",
    },
    uz: {
      title: "Vestibulyar buzilishlar",
      short: "Bosh aylanishi, beqarorlik, muvozanat buzilishi.",
    },
    tone: "#FFF0E8",
  },
  {
    slug: "dtsp",
    href: "/dtsp",
    ru: {
      title: "ДЦП",
      short: "Двигательная активность, речь и навыки самообслуживания у детей и взрослых.",
    },
    uz: {
      title: "DSS",
      short: "Bolalar va kattalarda harakat, nutq va oʻz-oʻziga xizmat koʻnikmalari.",
    },
    tone: "#EAF8F0",
  },
  {
    slug: "demieliniziruyushchie-zabolevaniya",
    href: "/demieliniziruyushchie-zabolevaniya",
    ru: {
      title: "Демиелинизирующие заболевания",
      short: "Поддержка нейропластичности при рассеянном склерозе и схожих состояниях.",
    },
    uz: {
      title: "Demiyelinizatsiyalovchi kasalliklar",
      short: "Tarqoq skleroz va oʻxshash holatlarda neyroplastikani qoʻllab-quvvatlash.",
    },
    tone: "#F3EEFF",
  },
  {
    slug: "degenerativnye-zabolevaniya",
    href: "/degenerativnye-zabolevaniya",
    ru: {
      title: "Дегенеративные заболевания ЦНС",
      short: "Поддержание координации, тонуса и качества жизни.",
    },
    uz: {
      title: "MSS degenerativ kasalliklari",
      short: "Koordinatsiya, tonus va hayot sifatini saqlash.",
    },
    tone: "#FFF8E6",
  },
  {
    slug: "rechevye-rasstroystva",
    href: "/rechevye-rasstroystva",
    ru: {
      title: "Речевые расстройства",
      short: "Артикуляция, задержка речи, коррекционная работа с логопедом.",
    },
    uz: {
      title: "Nutq buzilishlari",
      short: "Artikulyatsiya, nutq kechikishi, logoped bilan korreksiya.",
    },
    tone: "#FFEAF2",
  },
  {
    slug: "sdvg",
    href: "/sdvg",
    ru: {
      title: "СДВГ",
      short: "Внимание, самоконтроль и учебная/бытовая продуктивность.",
    },
    uz: {
      title: "DIQB",
      short: "Diqqat, oʻzini nazorat qilish va oʻquv/uy samaradorligi.",
    },
    tone: "#E8FBFF",
  },
  {
    slug: "insomniya",
    href: "/insomniya",
    ru: {
      title: "Инсомния",
      short: "Нормализация циклов сон/бодрствование.",
    },
    uz: {
      title: "Insomniya",
      short: "Uyqu/uygʻoqlik sikllarini normallashtirish.",
    },
    tone: "#EEF0FF",
  },
];

export const doctorReviews = [
  {
    id: "serova",
    name: { ru: "Серова Анна Александровна", uz: "Serova Anna Aleksandrovna" },
    role: {
      ru: "Психолог, преподаватель психологии, врач высшей категории, член международной ассоциации нейрореабилитологов",
      uz: "Psixolog, psixologiya o‘qituvchisi, oliy toifali shifokor",
    },
    text: {
      ru: "Применяю Нейропорт в коррекционной работе с детьми с нарушениями двигательной сферы, вниманием, памятью, речью. На протяжении 4-х лет Нейропорт является великолепным помощником в коррекционной практике...",
      uz: "Harakat, diqqat, xotira va nutq buzilishi boʻlgan bolalar bilan korreksiyada NeyroPortdan foydalanaman. 4 yildan beri ajoyib yordamchi.",
    },
  },
  {
    id: "guzenko",
    name: { ru: "Гузенко Светлана Борисовна", uz: "Guzenko Svetlana Borisovna" },
    role: {
      ru: "Президент Ассоциации Практикующих Логопедов Запорожской, Донецкой и Луганской областей",
      uz: "Amaliyotchi logopedlar assotsiatsiyasi prezidenti",
    },
    text: {
      ru: "Аппарат Нейропорт использую в работе со взрослыми после ЧМТ, инсульта на протяжении 3 лет. А так же в коррекционной работе с детьми с последствиями органических поражений ЦНС для когнитивный, речевой и двигательной реабилитации...",
      uz: "NeyroPort qurilmasini 3 yildan beri bosh miya shikastlanishi va insultdan keyin kattalar bilan, shuningdek MSS organik shikastlari oqibatidagi bolalar bilan ishlataman.",
    },
  },
  {
    id: "novikov",
    name: { ru: "Новиков Антон Геннадьевич", uz: "Novikov Anton Gennadyevich" },
    role: {
      ru: "Начальник медицинской службы в реабилитационном центре “ЭйрМЕД”",
      uz: "Reabilitatsiya markazi tibbiy xizmati boshligʻi",
    },
    text: {
      ru: "Наш центр профильно занимается электростимуляцией разного уровня воздействия для решения задач по восстановлению движения, поэтому мы обратили внимание на Нейропорт практически сразу...",
      uz: "Markazimiz elektrostimulyatsiya bilan shugʻullanadi. NeyroPortga darhol eʼtibor qaratdik va harakatni tiklash protokollariga kiritdik.",
    },
  },
  {
    id: "valiullina",
    name: { ru: "Валиуллина Гульнара Владимировна", uz: "Valiullina Gulnara Vladimirovna" },
    role: {
      ru: "Дефектолог, логопед, клинический психолог",
      uz: "Defektolog, logoped, klinik psixolog",
    },
    text: {
      ru: "В нашем центре аппарат используется уже 5 лет. Проводим транслингвальную нейростимуляцию для пациентов всех возрастных групп.",
      uz: "Markazimizda qurilma 5 yildan beri ishlatiladi. Barcha yosh guruhlari uchun translingual neyrostimulyatsiya oʻtkazamiz.",
    },
  },
];

export const clientReviews = [
  {
    id: "natalya",
    name: { ru: "Наталья Сергеевна", uz: "Natalya Sergeyevna" },
    topic: {
      ru: "Вестибулярные нарушения, ДЦП, задержка в развитии",
      uz: "Vestibulyar buzilishlar, DSS, rivojlanish kechikishi",
    },
    text: {
      ru: "Вот уже 8 месяцев использую Нейропорт. Эффект есть уже после 1 занятия. Если отслеживать динамику — после каждого сеанса устойчивость возрастает.",
      uz: "8 oydan beri NeyroPort ishlataman. 1 mashqdan keyin ham effekt bor. Dinamikani kuzatsangiz, har seansdan keyin barqarorlik oshadi.",
    },
  },
  {
    id: "anna",
    name: { ru: "Анна", uz: "Anna" },
    topic: { ru: "Инсульт", uz: "Insult" },
    text: {
      ru: "У мамы 86 лет случился инсульт. Подключили Нейропорт в ранней реабилитации — отмечаем прогресс в контакте и двигательной активности.",
      uz: "86 yoshli onamda insult boʻldi. Erta reabilitatsiyada NeyroPort uladik — aloqa va harakatda oʻsishni koʻramiz.",
    },
  },
  {
    id: "evgeniya",
    name: { ru: "Евгения", uz: "Yevgeniya" },
    topic: {
      ru: "Ухудшение состояния из-за стресса",
      uz: "Stress tufayli holat yomonlashuvi",
    },
    text: {
      ru: "После сильного стресса тряслись руки, кружилась голова. Курс с Нейропортом помог вернуть ясность и устойчивость.",
      uz: "Kuchli stressdan keyin qoʻllar titrar, bosh aylardi. NeyroPort kursi aniqlik va barqarorlikni qaytarishga yordam berdi.",
    },
  },
];

export const institutions = [
  {
    slug: "rauchfus",
    city: { ru: "Санкт-Петербург", uz: "Sankt-Peterburg" },
    name: {
      ru: "Детская городская больница № 19 им. К.А. Раухфуса",
      uz: "K.A. Rauxfus nomidagi 19-son bolalar shahar kasalxonasi",
    },
  },
  {
    slug: "fcbn",
    city: { ru: "Москва", uz: "Moskva" },
    name: {
      ru: "Федеральный центр мозга и нейротехнологий",
      uz: "Federal miya va neyrotexnologiyalar markazi",
    },
  },
  {
    slug: "vma",
    city: { ru: "Санкт-Петербург", uz: "Sankt-Peterburg" },
    name: {
      ru: "Военно-медицинская Академия имени С. М. Кирова",
      uz: "S.M. Kirov nomidagi Harbiy-tibbiy akademiya",
    },
  },
  {
    slug: "niior",
    city: { ru: "Москва", uz: "Moskva" },
    name: {
      ru: "НИИ общей реаниматологии имени В.А. Неговского",
      uz: "V.A. Negovskiy nomidagi umumiy reanimatologiya IlMI",
    },
  },
  {
    slug: "burdenko",
    city: { ru: "Москва", uz: "Moskva" },
    name: {
      ru: "ГВКГ имени академика Н.Н. Бурденко",
      uz: "N.N. Burdenko nomidagi Bosh harbiy klinik gospital",
    },
  },
];

export const faqItems = [
  {
    q: {
      ru: "Как проходит сеанс?",
      uz: "Seans qanday oʻtadi?",
    },
    a: {
      ru: "Языковая пластина размещается на кончике языка. Сеанс длится около 20 минут. Ощущения похожи на лёгкое покалывание.",
      uz: "Til plastinasi til uchiga qoʻyiladi. Seans taxminan 20 daqiqa. His-tuygʻu engil chaqishga oʻxshaydi.",
    },
  },
  {
    q: {
      ru: "Можно ли заниматься дома?",
      uz: "Uyda mashq qilish mumkinmi?",
    },
    a: {
      ru: "Да. После инструкции специалиста курс можно проводить дома по рекомендованному протоколу.",
      uz: "Ha. Mutaxassis yoʻriqnomasidan keyin kursni uyda tavsiya etilgan protokol boʻyicha oʻtkazish mumkin.",
    },
  },
  {
    q: {
      ru: "Есть ли противопоказания?",
      uz: "Qarshi koʻrsatmalar bormi?",
    },
    a: {
      ru: "Есть. Перед началом необходима консультация специалиста. Мы поможем оценить показания.",
      uz: "Bor. Boshlashdan oldin mutaxassis konsultatsiyasi kerak. Koʻrsatmalarni baholashga yordam beramiz.",
    },
  },
  {
    q: {
      ru: "Можно ли взять в аренду?",
      uz: "Ijaraga olish mumkinmi?",
    },
    a: {
      ru: "Да, доступна аренда на курс. Подробности — на странице «Аренда» или у менеджера.",
      uz: "Ha, kurs uchun ijara mavjud. Tafsilotlar — «Ijara» sahifasida yoki menejerdan.",
    },
  },
];

export const newsSeed = [
  {
    slug: "start-uz",
    date: "2026-03-01",
    title: {
      ru: "НейроПорт в Узбекистане",
      uz: "NeyroPort Oʻzbekistonda",
    },
    excerpt: {
      ru: "Открываем информационный портал и линию консультаций для пациентов и клиник Узбекистана.",
      uz: "Oʻzbekiston bemorlari va klinikalari uchun axborot portali va konsultatsiya liniyasini ochamiz.",
    },
  },
  {
    slug: "tlns-overview",
    date: "2026-02-12",
    title: {
      ru: "Что такое транслингвальная нейростимуляция",
      uz: "Translingual neyrostimulyatsiya nima",
    },
    excerpt: {
      ru: "Краткий обзор метода ТЛНС и областей применения в реабилитации.",
      uz: "TLNS usuli va reabilitatsiyadagi qoʻllanish sohalari haqida qisqacha.",
    },
  },
];
