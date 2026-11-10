// AURA Commerce — Atelier Journal
// Editorial articles about craft, materials, people, and sustainability.
// Each article body is a structured block sequence rendered by JournalArticle.

export type JournalCategory = "Craft" | "Materials" | "People" | "Sustainability";

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "list"; items: string[] };

export interface JournalArticleMeta {
  slug: string;
  title: string;
  dek: string; // subtitle / deck
  category: JournalCategory;
  author: string;
  authorRole: string;
  date: string; // ISO yyyy-mm-dd
  readingTime: number; // minutes
  hero: string;
  featured?: boolean;
}

export interface JournalArticleFull extends JournalArticleMeta {
  body: ArticleBlock[];
}

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  "Craft",
  "Materials",
  "People",
  "Sustainability",
];

const IMG = {
  morningLight: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9dc0a94fac1e.jpg",
  atelier: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ad6805beb3f4.jpg",
  finishing: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e55eb7a6f9a9.jpg",
  leather: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/18cb5a37eb3c.jpg",
  watchmaker: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/704f0c809e07.jpg",
  portrait: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/274db4309f84.jpg",
  brassInstrument: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0cd940371b5c.jpg",
  brushedMetal: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/540bf36f3c07.jpg",
  notebook: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e998fe202258.jpg",
};

export const JOURNAL_ARTICLES: JournalArticleFull[] = [
  {
    slug: "the-quiet-hours",
    title: "The quiet hours",
    dek: "Why our atelier begins every piece before the sun is up — and what the silence teaches the hand.",
    category: "People",
    author: "Camille Ferrand",
    authorRole: "Founding artisan, Paris",
    date: "2025-04-02",
    readingTime: 6,
    hero: IMG.morningLight,
    featured: true,
    body: [
      {
        type: "paragraph",
        text: "At five minutes to six the bench lamp clicks on over the leather station, and for the next ninety minutes the only sound in the atelier is the soft, metronome scratch of an awl finding its line. We do not schedule this silence. We protect it.",
      },
      {
        type: "quote",
        text: "The hand remembers what the mind was too busy to notice. You cannot rush a memory into forming.",
        cite: "Camille Ferrand",
      },
      {
        type: "paragraph",
        text: "There is a practical reason for the early start: the leather is cooler, the humidity is right, and the hide takes an edge more cleanly before the room warms. But the practical reason is not the real one. The real one is that in the quiet hours, there is no version of you performing the work — there is only the work.",
      },
      { type: "heading", text: "What the silence is for" },
      {
        type: "paragraph",
        text: "Modern production optimises for throughput. We optimise for attention. A piece cut at 6 a.m. and a piece cut at 2 p.m. may look identical to a photograph, but the hand that made the first one was present in a way the afternoon hand cannot be — distracted by deliveries, by messages, by the low hum of a world asking for replies.",
      },
      {
        type: "image",
        src: IMG.atelier,
        alt: "Sunlit atelier interior with workbenches and hand tools",
        caption: "The main bench, photographed at first light.",
      },
      {
        type: "paragraph",
        text: "We are not romantic about difficulty. The early hours are hard on the body and harder on the family calendar. But every artisan who has stayed with us past the first year has, unprompted, shifted their mornings earlier. It is the only conspiracy of habit the atelier asks of anyone.",
      },
      { type: "heading", text: "A small experiment" },
      {
        type: "paragraph",
        text: "If you make things for a living — or even if you don't — try one quiet hour before the world logs on. No music. No podcast. Only the object and you. We suspect you will not need to be told twice.",
      },
    ],
  },
  {
    slug: "on-patience-as-a-material",
    title: "On patience as a material",
    dek: "Seven stages of polish, and why the last one has no name. A short defence of the unfashionable virtue.",
    category: "Craft",
    author: "Daniel Cho",
    authorRole: "Head of finishing",
    date: "2025-03-18",
    readingTime: 5,
    hero: IMG.finishing,
    body: [
      {
        type: "paragraph",
        text: "A finish is not a coating. A finish is a record — of pressure, of time, of the number of passes a hand was willing to make before it stopped. We count those passes. We count them because they are the only honest unit a finish can be measured in.",
      },
      { type: "heading", text: "The seven stages" },
      {
        type: "list",
        items: [
          "Rough — removing the mill marks left by the cutter.",
          "True — establishing a single, continuous plane.",
          "Satin — the first stage at which light behaves.",
          "Even — closing the grain so the surface reads as one material.",
          "Deep — the polish that lives below the surface, not on it.",
          "Set — letting the material rest for 48 hours before the final pass.",
          "— — the last stage, which we do not name.",
        ],
      },
      {
        type: "paragraph",
        text: "The seventh stage is the one nobody can teach. It is the moment the artisan looks at the piece and decides it is done — not because the spec says so, but because the object has stopped asking for more. You can describe the first six stages to a buyer. The seventh you can only point at.",
      },
      {
        type: "quote",
        text: "Patience is not the absence of speed. It is the presence of attention.",
      },
      {
        type: "image",
        src: IMG.leather,
        alt: "Leather tools and materials laid out on a workshop mat",
        caption: "The finishing bench, stage three through six.",
      },
      {
        type: "paragraph",
        text: "We are aware that 'patience' is an unfashionable word in a year that prizes acceleration. We are also aware that the objects we make outlast the years that prize acceleration. This is, we think, not a coincidence.",
      },
    ],
  },
  {
    slug: "the-last-watchmaker-in-le-sentier",
    title: "The last watchmaker in Le Sentier",
    dek: "A morning with Henri Vautier, who has assembled movements in the same valley for forty-one years.",
    category: "People",
    author: "Priya Subramanian",
    authorRole: "Editor at large",
    date: "2025-02-26",
    readingTime: 8,
    hero: IMG.watchmaker,
    body: [
      {
        type: "paragraph",
        text: "Le Sentier is a village of fewer than a thousand people in the Vallée de Joux, two hours by train from Geneva and approximately two centuries from anywhere else. Henri Vautier has worked here since 1984. He has trained eleven watchmakers. Ten of them still live in the valley.",
      },
      {
        type: "quote",
        text: "I do not assemble movements. I let them assemble themselves, and I keep the parts company while they decide.",
        cite: "Henri Vautier",
      },
      {
        type: "paragraph",
        text: "He says this without irony. Watching him work, you begin to understand what he means. The tweezers find the jewels before his eyes seem to direct them. The screwdriver turns exactly the angle the screw wants. There is a conversation between the hand and the brass that does not require the forebrain.",
      },
      { type: "heading", text: "On the question of succession" },
      {
        type: "paragraph",
        text: "I ask him, carefully, who takes the bench when he stops. He points to a photograph on the wall — a young woman, gloved, mid-assembly. 'My granddaughter,' he says. 'She is nineteen. She has been coming here since she was small enough to sit on the stool.' He pauses. 'She is faster than I am. She will be better than I am. This is the only way the trade survives — each generation must be allowed to exceed the last.'",
      },
      {
        type: "image",
        src: IMG.portrait,
        alt: "Portrait of a master craftsman at his workbench",
        caption: "Henri, photographed on the morning of our visit.",
      },
      {
        type: "paragraph",
        text: "The Meridian movement in our catalogue passes through his bench for final regulation. Every one of them. It is, he says, the last thing he will ever agree to do for money, and the first thing he would continue to do without it.",
      },
    ],
  },
  {
    slug: "brass-reclaimed",
    title: "Brass, reclaimed",
    dek: "How a salvage yard in Birmingham became the cleanest link in our supply chain.",
    category: "Sustainability",
    author: "Marcus Lindqvist",
    authorRole: "Head of materials",
    date: "2025-02-04",
    readingTime: 5,
    hero: IMG.brassInstrument,
    body: [
      {
        type: "paragraph",
        text: "The brass in every AURA fitting began life as something else — a ship's porthole, a French horn that cracked, a shipyard valve that outlived its ship. We know this because we buy it by the kilo from a yard in Birmingham that has been sorting non-ferrous scrap since 1962, and they keep receipts.",
      },
      {
        type: "quote",
        text: "Recycled brass is not a compromise. Mined brass is. One of them required a mountain.",
      },
      {
        type: "paragraph",
        text: "The chemistry is straightforward: brass is an alloy of copper and zinc, and both elements survive re-melting without degradation. A fitting cast from reclaimed brass is, atomically, indistinguishable from one cast from virgin stock. The difference is entirely in what you didn't have to dig up.",
      },
      { type: "heading", text: "The ledger" },
      {
        type: "list",
        items: [
          "98% of the brass in our fittings is post-consumer reclaimed.",
          "Each kilo avoids approximately 4.2 kg of mined ore.",
          "Our refinisher's energy is 100% grid-renewable since 2023.",
          "Every batch is traceable to its salvage source via a stamped lot code.",
        ],
      },
      {
        type: "image",
        src: IMG.brushedMetal,
        alt: "Brushed metal texture with a satin finish",
        caption: "Reclaimed brass, refinished to a satin patina.",
      },
      {
        type: "paragraph",
        text: "We do not believe sustainability is a marketing position. We believe it is an accounting one — a ledger of what was taken and what was left. We are happy to share ours, in full, with anyone who asks.",
      },
    ],
  },
  {
    slug: "what-we-mean-by-finished",
    title: "What we mean by 'finished'",
    dek: "A short glossary of the words we use when an object leaves the bench — and the ones we don't.",
    category: "Materials",
    author: "Camille Ferrand",
    authorRole: "Founding artisan, Paris",
    date: "2025-01-15",
    readingTime: 4,
    hero: IMG.leather,
    body: [
      {
        type: "paragraph",
        text: "'Finished' is a word that does a lot of unpaid work in product copy. We have tried to pay it better. Below is the internal glossary we use when an object leaves the bench — the words we mean, and the words we have agreed not to use.",
      },
      { type: "heading", text: "Words we mean" },
      {
        type: "list",
        items: [
          "Hand-finished: every visible surface has been touched by a human hand after the machine.",
          "Edge-painted: the cut edges have been sealed, not merely glued.",
          "Stitched, not glued: where a seam exists, it is sewn.",
          "Signed: the artisan who closed the object has marked it inside.",
        ],
      },
      { type: "heading", text: "Words we do not use" },
      {
        type: "list",
        items: [
          "Premium (we prefer specific).",
          "Luxury (we prefer made to be kept).",
          "Exclusive (we prefer few).",
          "Perfect (we prefer finished).",
        ],
      },
      {
        type: "quote",
        text: "A finished object is not a perfect one. It is one that has stopped asking to be worked on.",
      },
      {
        type: "image",
        src: IMG.finishing,
        alt: "Hands finishing a leather surface with tools",
        caption: "The moment we stop — and call it finished.",
      },
    ],
  },
  {
    slug: "a-letter-from-the-founder",
    title: "A letter from the founder",
    dek: "Ten years on, a short note on what has changed and what has not.",
    category: "Craft",
    author: "Camille Ferrand",
    authorRole: "Founder, AURA",
    date: "2024-12-10",
    readingTime: 5,
    hero: IMG.notebook,
    body: [
      {
        type: "paragraph",
        text: "Ten years ago this month we cut the first piece of leather in a two-bench workshop above a Paris bookbinder. The rule we wrote on the wall that day — make nothing you wouldn't keep for a lifetime — has not changed. The benches have. There are now fourteen of them, spread across Europe, and the people at them are better than I will ever be.",
      },
      {
        type: "quote",
        text: "The rule hasn't changed. The benches have.",
      },
      {
        type: "paragraph",
        text: "I write this not as a press release but as a letter — to the people who have kept one of our objects through a decade of their own lives, and to the people who are considering their first. You are not buying a product. You are commissioning a small inheritance. We treat it that way.",
      },
      { type: "heading", text: "What has changed" },
      {
        type: "list",
        items: [
          "We have grown from two benches to fourteen, across four ateliers.",
          "98% of our metal inputs are now reclaimed.",
          "Every object carries a lifetime craftsmanship guarantee — and we mean it.",
        ],
      },
      { type: "heading", text: "What has not" },
      {
        type: "list",
        items: [
          "The rule on the wall.",
          "The conviction that fewer things, made exceptionally well, is enough.",
          "The belief that an object should be kept, not replaced.",
        ],
      },
      {
        type: "image",
        src: IMG.atelier,
        alt: "The atelier at first light",
        caption: "Where we began, and where we still begin every day.",
      },
      {
        type: "paragraph",
        text: "Thank you for the first ten years. We intend to earn the next ten the same way — quietly, and with our hands. — C.F.",
      },
    ],
  },
];

export function getJournalArticle(slug: string): JournalArticleFull | undefined {
  return JOURNAL_ARTICLES.find((a) => a.slug === slug);
}
