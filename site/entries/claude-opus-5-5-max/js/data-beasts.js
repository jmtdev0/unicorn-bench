/* =============================================================
   Unicornis: the herd
   Fourteen unicorns of myth and nature, with the horn spec used
   to draw each one. Exposes window.BEASTS and window.BEAST_QUIZ.
   ============================================================= */
(function () {
  'use strict';

  const BEASTS = [
    {
      id: 'monoceros',
      name: 'The Monoceros',
      aka: "Pliny's unicorn",
      kind: 'legend',
      region: 'asia',
      place: 'India, as described in Rome',
      first: 'c. 77 CE',
      tagline: "The fiercest beast in Rome's encyclopedia",
      summary: "A horse's body, a stag's head, an elephant's feet, a boar's tail, and one black horn two cubits long.",
      details: [
        'In his <cite>Natural History</cite>, the Roman author Pliny the Elder listed the monoceros among the wonders of India and called it the fiercest of animals. It had the body of a horse, the head of a stag, the feet of an elephant and the tail of a boar; it bellowed in a deep voice, and from the middle of its forehead rose a single black horn two cubits long.',
        'Pliny added that it could never be captured alive. Storytellers spent the next fifteen centuries trying to prove him wrong.'
      ],
      horn: 'Black and straight, about two cubits (roughly 90 cm)',
      fact: "Pliny's patchwork beast (horse, stag, elephant, boar) reads a lot like a secondhand description of an Indian rhinoceros.",
      stats: { horn: 4, ferocity: 5, elusiveness: 4, sparkle: 1 },
      spec: { length: 170, width: 30, colors: ['#4a4466', '#1e1a30', '#0b0a12'], spiral: 7, dark: true, groove: 'rgba(0,0,0,.5)', edge: 'rgba(0,0,0,.6)', bg: ['#5a4a9a', '#1d1645'], sparkColor: '#ffe49c' }
    },
    {
      id: 'ctesias',
      name: 'The Indian Wild Ass',
      aka: "Ctesias's unicorn",
      kind: 'legend',
      region: 'asia',
      place: 'India, as told at the Persian court',
      first: 'c. 400 BCE',
      tagline: 'The first unicorn in Greek writing',
      summary: 'Swift, white-bodied and red-headed, with blue eyes and a three-colored horn that made poison-proof cups.',
      details: [
        'Ctesias of Cnidus was a Greek physician at the Persian royal court around 400 BCE. In his book on India he described wild asses as large as horses or larger, with white bodies, dark red heads and blue eyes, and a single horn on the forehead.',
        'The horn was white at the base, black in the middle and crimson at the tip. Those who drank from cups made of it, he reported, were protected against poison and convulsions. Ctesias never traveled to India himself; he was passing on stories that reached the Persian court.'
      ],
      horn: 'White at the base, black in the middle, crimson at the tip',
      fact: 'This is the oldest description of a unicorn in Greek literature, and the start of a two-thousand-year belief that unicorn horn defeats poison.',
      stats: { horn: 3, ferocity: 2, elusiveness: 4, sparkle: 3 },
      spec: { length: 150, width: 34, colors: ['#ffffff', '#1a1420', '#c0182e'], hard: true, edge: 'rgba(60,20,30,.5)', bg: ['#ffe6da', '#f0b39c'] }
    },
    {
      id: 'maiden',
      name: "The Maiden's Unicorn",
      aka: 'The unicorn of medieval Europe',
      kind: 'legend',
      region: 'europe',
      place: 'Medieval Europe',
      first: '2nd–4th century CE',
      tagline: 'Untameable, except by kindness',
      summary: "Small, fierce and impossible to hunt, it would lay its head in a maiden's lap and fall asleep.",
      details: [
        'The <cite>Physiologus</cite>, an early Christian book of animal lore probably compiled in Alexandria, describes the unicorn as a small animal, like a young goat, yet so fierce that no hunter can approach it. Only a pure maiden can tame it: the unicorn runs to her, lays its head in her lap and falls asleep.',
        'Medieval bestiaries copied and embroidered the tale, reading it as an allegory of Christ. Artists gave the creature a goat\'s beard, cloven hooves and a lion\'s tail, and showed it dipping its horn into poisoned streams to make them pure, as in the famous Unicorn Tapestries in New York.'
      ],
      horn: 'Long, ivory and spiraled: a narwhal tusk in all but name',
      fact: 'In the tapestry <cite>The Unicorn Rests in a Garden</cite>, the unicorn sits inside a fence so low it could easily leap out. Many viewers read it as a willing captive.',
      stats: { horn: 4, ferocity: 3, elusiveness: 5, sparkle: 5 },
      spec: { length: 180, width: 26, colors: ['#fffdf7', '#f1e6d2', '#dccbaa'], spiral: 10, bg: ['#ece6ff', '#c3b6f5'] }
    },
    {
      id: 'qilin',
      name: 'The Qilin',
      aka: 'Kirin in Japan · Girin in Korea',
      kind: 'legend',
      region: 'asia',
      place: 'China, Japan and Korea',
      first: '1st millennium BCE',
      tagline: 'A gentle omen of wise rulers',
      summary: 'A scaled, hoofed chimera that harms no living thing and appears only in times of peace.',
      details: [
        'The qilin is one of the most auspicious creatures of Chinese tradition. Descriptions vary (deer- or ox-like, with scales, hooves, a flowing mane and often a single horn) but its character does not: it is said to be so gentle that it walks without crushing the grass beneath its hooves, and to appear only when a wise ruler is on the throne or a great sage is born.',
        "Legend says a qilin appeared to Confucius's mother before his birth. When one was captured in the state of Lu in 481 BCE, Confucius is said to have wept, and the <cite>Spring and Autumn Annals</cite> end with that event.",
        'In 1414 a giraffe brought by sea from Bengal was presented to the Yongle Emperor, and courtiers hailed it as a living qilin.'
      ],
      horn: 'Short and fleshy, sometimes branched; often a single horn in Japanese art',
      fact: '<i>Kirin</i> is also the everyday Japanese word for giraffe, and <i>girin</i> the Korean one.',
      stats: { horn: 2, ferocity: 1, elusiveness: 4, sparkle: 4 },
      spec: { length: 104, width: 32, bend: -0.3, colors: ['#d4f5df', '#5fbf8f', '#2f7f5f'], rings: 5, ringTo: 0.8, groove: 'rgba(20,70,40,.35)', bg: ['#e3fff0', '#9fe3c1'] }
    },
    {
      id: 'xiezhi',
      name: 'The Xiezhi',
      aka: 'Haechi in Korea · Kaichi in Japan',
      kind: 'legend',
      region: 'asia',
      place: 'China',
      first: 'By the 1st century CE',
      tagline: 'The unicorn of justice',
      summary: 'A one-horned beast with an infallible sense of right and wrong. It butted the guilty party with its horn.',
      details: [
        'Chinese legend tells of the xiezhi, a goat- or ox-like creature with a single horn and an unerring sense of justice. The legendary judge Gao Yao was said to keep one: when a case could not be decided, the xiezhi would butt whoever was guilty.',
        'Its image became an emblem of the law. Under the Ming and Qing dynasties, imperial censors wore it embroidered on their robes, and its Korean cousin, the haechi, still stands guard in stone outside Gyeongbokgung Palace in Seoul.'
      ],
      horn: 'A single sharp horn, reserved for the guilty',
      fact: 'Seoul adopted the haechi as the official symbol of the city in 2008.',
      stats: { horn: 3, ferocity: 3, elusiveness: 3, sparkle: 2 },
      spec: { length: 132, width: 32, bend: -0.12, colors: ['#f6dcaa', '#c98f3d', '#7a4f1c'], rings: 7, ringTo: 0.75, groove: 'rgba(80,40,0,.35)', bg: ['#fff1d6', '#f0c98a'] }
    },
    {
      id: 'karkadann',
      name: 'The Karkadann',
      aka: 'Kargadan',
      kind: 'legend',
      region: 'middle-east',
      place: 'Persia, Arabia and India',
      first: 'Medieval Persian and Arabic texts',
      tagline: 'The terror of the plains',
      summary: 'A huge, ferocious one-horned beast said to skewer elephants, yet soothed by the song of a dove.',
      details: [
        'Medieval Persian and Arabic writers described the karkadann as a gigantic, short-tempered beast of the plains of India and Persia, with one horn strong enough to impale an elephant. Its name is simply the Persian and Arabic word for rhinoceros, and the karkadann is very likely the rhino, seen through centuries of storytelling.',
        "In the tales of Sindbad the Sailor, a karkadann carries an elephant on its horn until the elephant's fat, melting in the sun, runs into its eyes and blinds it. Then a giant bird, the roc, carries off both of them.",
        'It had a softer side. According to some accounts, the fearsome creature loved the song of the ring-dove and would rest quietly beneath any tree where one was singing.'
      ],
      horn: 'Massive, curved and nearly unbreakable',
      fact: '<i>Karkadann</i> and <i>kargadan</i> are still the everyday Arabic and Persian words for rhinoceros.',
      stats: { horn: 5, ferocity: 5, elusiveness: 2, sparkle: 1 },
      spec: { length: 150, width: 58, profile: 'rhino', bend: 0.16, colors: ['#3b2f28', '#6a5240', '#d6ad6a'], dark: true, bg: ['#ffe2c4', '#e2a172'] }
    },
    {
      id: 'shadhavar',
      name: 'The Shadhavar',
      aka: 'The singing unicorn',
      kind: 'legend',
      region: 'middle-east',
      place: 'Persian and Arabic wonder-books',
      first: '13th century',
      tagline: 'A horn that plays the wind',
      summary: 'A gazelle-like creature whose hollow horn has 42 branches. When the wind blows through them, it makes irresistible music.',
      details: [
        'Medieval wonder-books, such as the cosmography of the 13th-century Persian scholar Zakariya al-Qazwini, describe the shadhavar: a creature like a gazelle whose single horn is hollow and divided into forty-two branches.',
        'When the wind blows through the branches, the horn plays music so lovely that animals gather spellbound around it. Some retellings add a darker twist: the music is a lure.'
      ],
      horn: 'Hollow, with 42 branches that whistle in the wind',
      fact: "We've drawn only a few of the branches; forty-two would be a lot of whistling. Press the play button to hear our best guess at the sound.",
      stats: { horn: 4, ferocity: 2, elusiveness: 4, sparkle: 4 },
      spec: { length: 150, width: 30, branches: 8, colors: ['#fff7e6', '#f2d29a', '#d9a450'], groove: 'rgba(110,70,10,.35)', bg: ['#fdf2ff', '#e2c2ff'] },
      audio: true
    },
    {
      id: 'reem',
      name: "The Re'em",
      aka: 'The unicorn of the Bible',
      kind: 'legend',
      region: 'middle-east',
      place: 'The ancient Near East',
      first: 'Hebrew Bible',
      tagline: 'A translation that became a legend',
      summary: "A mighty wild beast of the Hebrew Bible. Greek translators called it 'one-horn', and English Bibles followed.",
      details: [
        "Several books of the Hebrew Bible mention the re'em, a powerful wild animal that cannot be tamed. When the scriptures were translated into Greek in the last centuries BCE, the translators rendered <i>re'em</i> as <i>monokeros</i>, 'one horn', and later translations followed. The King James Bible of 1611 mentions unicorns nine times.",
        "Most scholars now believe the re'em was the aurochs, the enormous wild ox of Europe and the Near East. Seen in profile, as in ancient reliefs, its two great horns can look like one."
      ],
      horn: 'Two great horns, seen as one in profile',
      fact: 'The last known aurochs, a female, died in Poland\'s Jaktorów Forest in 1627.',
      stats: { horn: 4, ferocity: 4, elusiveness: 3, sparkle: 1 },
      spec: { length: 124, width: 36, bend: 0.38, colors: ['#f2ead8', '#a8957a', '#2b241c'], pair: 14, bg: ['#f5ecdc', '#d5bf99'] }
    },
    {
      id: 'indrik',
      name: 'Indrik the Beast',
      aka: 'Indrik-zver',
      kind: 'legend',
      region: 'europe',
      place: 'Russia',
      first: 'Medieval Russian spiritual verse',
      tagline: 'The father of all beasts',
      summary: 'A horned king of animals who lives on a holy mountain and travels beneath the earth as the sun crosses the sky.',
      details: [
        'The <cite>Dove Book</cite>, a Russian spiritual verse, names Indrik as the father of all beasts. It lives on a holy mountain and moves through the underground as freely as the sun moves across the sky.',
        "Folk artists often pictured Indrik with a single horn, which is how it joined the world's unicorn family. In 1916 the paleontologist Alexei Borissiak named a giant fossil relative of the rhinoceros <i>Indricotherium</i> in its honor."
      ],
      horn: 'A single long horn, in folk art',
      fact: '<i>Indricotherium</i> was one of the largest land mammals that ever lived, and it had no horn at all.',
      stats: { horn: 3, ferocity: 2, elusiveness: 5, sparkle: 3 },
      spec: { length: 150, width: 30, colors: ['#ffffff', '#cfdcf5', '#8da3d6'], spiral: 8, groove: 'rgba(40,60,120,.32)', bg: ['#e7efff', '#a9bff0'] }
    },
    {
      id: 'camahueto',
      name: 'The Camahueto',
      aka: 'The sea unicorn of Chiloé',
      kind: 'legend',
      region: 'americas',
      place: 'Chiloé, southern Chile',
      first: 'Chilote folklore',
      tagline: 'A unicorn that runs for the sea',
      summary: 'A powerful one-horned calf from Chilean folklore. Once grown, it charges from the rivers to the ocean.',
      details: [
        'On the islands of the Chiloé archipelago in southern Chile, stories tell of the camahueto, a calf- or bull-like creature with a single horn on its forehead. It grows up in the beds of streams, and when it is fully grown it charges toward the sea, tearing up the earth as it goes.',
        'Some tales say that a skilled healer can catch one with a lasso of seaweed and use scrapings from its horn as a powerful medicine.'
      ],
      horn: 'A single horn, prized as medicine',
      fact: 'The camahueto shares its islands with other famous figures of Chilote folklore, including the Caleuche, a glowing ghost ship.',
      stats: { horn: 3, ferocity: 4, elusiveness: 4, sparkle: 2 },
      spec: { length: 112, width: 40, bend: 0.12, colors: ['#fff4c9', '#ffd36b', '#d39a1f'], spiral: 4, groove: 'rgba(110,60,0,.32)', bg: ['#dff8ff', '#8fd6ec'] }
    },
    {
      id: 'elasmotherium',
      name: 'Elasmotherium',
      aka: 'The Siberian unicorn',
      kind: 'real',
      region: 'asia',
      place: 'Eurasian steppe (extinct)',
      first: 'Lived until at least 39,000 years ago',
      tagline: 'A real unicorn, sort of',
      summary: 'A giant, shaggy rhinoceros of the Ice Age steppe with a huge dome on its forehead, likely the base of one enormous horn.',
      details: [
        '<i>Elasmotherium sibiricum</i> was a giant rhinoceros that grazed the grasslands stretching from eastern Europe to western Siberia. It weighed several tonnes, and a great bony dome on its forehead suggests it carried a single, very large horn.',
        'Horn is made of keratin, which rarely fossilizes, so no <i>Elasmotherium</i> horn has ever been found. Its true size and shape are educated guesses, which is why our drawing is dashed.',
        'In 2018, radiocarbon dating of fossils showed that it survived until at least 39,000 years ago, long enough to share the steppe with early modern humans.'
      ],
      horn: 'Probably enormous, but never found',
      fact: "Ancient DNA shows its lineage split from the ancestors of today's rhinos tens of millions of years ago.",
      stats: { horn: 5, ferocity: 2, elusiveness: 5, sparkle: 1 },
      spec: { length: 132, width: 84, profile: 'rhino', bend: 0.18, dashed: true, colors: ['#cdb99e', '#8d7458', '#5b4632'], bg: ['#f1ece4', '#cbbda8'] }
    },
    {
      id: 'narwhal',
      name: 'The Narwhal',
      aka: 'The unicorn of the sea',
      kind: 'real',
      region: 'arctic',
      place: 'Arctic waters',
      first: 'Alive today',
      tagline: 'The tooth behind the legend',
      summary: "An Arctic whale whose 'horn' is a spiraling tooth up to 3 m long. For centuries its tusks were sold as unicorn horn.",
      details: [
        "The narwhal, <i>Monodon monoceros</i> ('one tooth, one horn'), lives in the icy waters around Greenland, Canada, Norway and Russia. Its famous tusk, found mostly on males, is a canine tooth that grows straight out through the upper lip, spiraling counterclockwise, and can reach about 3 meters (10 feet).",
        'Medieval Norse traders brought narwhal tusks to Europe, where they were sold as unicorn horns for staggering sums. Kings drank from them, apothecaries ground them into powder, and the kings of Denmark sat on a throne made from them.',
        'What the tusk is for is still debated. It may help males compete for mates, and it is packed with nerve endings that could sense the water around it.'
      ],
      horn: 'A left-handed spiral tooth, up to about 3 m',
      fact: 'Narwhal tusks spiral counterclockwise. So does every spiral horn drawn on this website.',
      stats: { horn: 5, ferocity: 1, elusiveness: 3, sparkle: 3 },
      spec: { length: 204, width: 18, profile: 'tusk', colors: ['#fffaf0', '#efe6d2', '#d4c7ab'], spiral: 16, bg: ['#dff3ff', '#94c4e6'] }
    },
    {
      id: 'rhino',
      name: 'The Indian Rhinoceros',
      aka: 'Rhinoceros unicornis',
      kind: 'real',
      region: 'asia',
      place: 'India and Nepal',
      first: 'Alive today',
      tagline: "Officially named 'unicorn'",
      summary: "The greater one-horned rhinoceros. Travelers' tales of this animal helped shape the unicorn myth.",
      details: [
        "The greater one-horned rhinoceros lives in the grasslands of northern India and Nepal. In 1758 Carl Linnaeus named it <i>Rhinoceros unicornis</i>, the 'one-horned nose-horn'. Many historians think garbled reports of this animal lie behind Ctesias's wild ass, Pliny's monoceros and the Persian karkadann.",
        'Its horn is made of keratin, the same material as our fingernails. Hunted to the brink, the species fell to around 200 animals in the early 20th century; thanks to decades of protection, more than 4,000 live today.'
      ],
      horn: 'Single, thick, made of keratin',
      fact: "Albrecht Dürer's famous 1515 woodcut shows an Indian rhinoceros that he never saw. He worked from a written description and a sketch.",
      stats: { horn: 3, ferocity: 3, elusiveness: 2, sparkle: 1 },
      spec: { length: 112, width: 76, profile: 'rhino', bend: 0.2, colors: ['#8a8378', '#4c463f', '#2a2622'], dark: true, bg: ['#eef2e3', '#b9c79a'] }
    },
    {
      id: 'oryx',
      name: 'The Arabian Oryx',
      aka: 'Oryx leucoryx',
      kind: 'real',
      region: 'middle-east',
      place: 'Arabian Peninsula',
      first: 'Alive today',
      tagline: 'Two horns that look like one',
      summary: 'A white desert antelope with long, straight horns. In profile, the pair can line up perfectly.',
      details: [
        'The Arabian oryx is a white antelope of the Arabian deserts with dark facial markings and long, straight, ringed horns. Seen in profile, its two horns can line up so neatly that the animal seems to have only one, and Aristotle listed the oryx as a one-horned animal.',
        "Hunted to extinction in the wild by 1972, it survived in zoos and private collections. A breeding program returned it to Oman in 1982, and in 2011 it became the first animal to move from 'Extinct in the Wild' back to 'Vulnerable' on the IUCN Red List."
      ],
      horn: 'Two long, straight, ringed horns',
      fact: 'Arabian oryx are said to sense rainfall from far away and walk toward it.',
      stats: { horn: 4, ferocity: 2, elusiveness: 3, sparkle: 2 },
      spec: { length: 190, width: 16, profile: 'slender', colors: ['#5b4a3a', '#2d241c', '#1a140f'], rings: 16, ringTo: 0.7, pair: 9, dark: true, groove: 'rgba(0,0,0,.45)', bg: ['#fff6e6', '#f2d6a8'] }
    }
  ];

  const REGIONS = [
    { id: 'europe', label: 'Europe' },
    { id: 'asia', label: 'Asia' },
    { id: 'middle-east', label: 'Middle East' },
    { id: 'americas', label: 'Americas' },
    { id: 'arctic', label: 'Arctic' }
  ];

  /* Which unicorn are you? Each answer awards points to a few creatures. */
  const BEAST_QUIZ = [
    {
      q: 'Pick a place to call home.',
      a: [
        { t: 'A walled garden full of flowers', w: { maiden: 3, qilin: 1 } },
        { t: 'A holy mountain, or deep beneath it', w: { indrik: 3, qilin: 2 } },
        { t: 'Golden dunes under an enormous sky', w: { oryx: 3, shadhavar: 2 } },
        { t: 'Wild seas and rocky islands', w: { narwhal: 3, camahueto: 3 } }
      ]
    },
    {
      q: 'A stranger wanders into your meadow. You…',
      a: [
        { t: 'Charge. Ask questions never.', w: { monoceros: 3, karkadann: 3 } },
        { t: 'Bow politely and offer them tea.', w: { qilin: 3, maiden: 1 } },
        { t: 'Study them closely. Are they honest?', w: { xiezhi: 3, reem: 1 } },
        { t: 'Hum a little tune and see what happens.', w: { shadhavar: 3, karkadann: 1 } }
      ]
    },
    {
      q: 'Choose a snack.',
      a: [
        { t: 'Wildflowers with the dew still on', w: { maiden: 2, ctesias: 2 } },
        { t: 'Whatever the desert provides', w: { oryx: 3, karkadann: 1 } },
        { t: 'Fresh Arctic cod', w: { narwhal: 3 } },
        { t: 'An entire meadow of grass', w: { elasmotherium: 3, rhino: 3, reem: 2 } }
      ]
    },
    {
      q: 'Your friends would describe you as…',
      a: [
        { t: 'Utterly untameable', w: { reem: 3, monoceros: 3 } },
        { t: 'Wise and scrupulously fair', w: { xiezhi: 3, qilin: 2, indrik: 1 } },
        { t: 'A beautiful mystery', w: { camahueto: 2, indrik: 2, shadhavar: 1 } },
        { t: 'Strong, steady and hard to rattle', w: { rhino: 3, elasmotherium: 2 } }
      ]
    },
    {
      q: 'Pick a treasure.',
      a: [
        { t: 'A cup that protects against poison', w: { ctesias: 3, maiden: 1 } },
        { t: 'An old map of tunnels under the world', w: { indrik: 3 } },
        { t: 'A fossil older than any kingdom', w: { elasmotherium: 3, reem: 1 } },
        { t: 'A healing charm from the sea', w: { camahueto: 3, narwhal: 1 } }
      ]
    },
    {
      q: 'Choose a superpower.',
      a: [
        { t: 'Outrunning absolutely anyone', w: { ctesias: 3, oryx: 1 } },
        { t: 'Surviving against all odds', w: { oryx: 2, rhino: 2, reem: 2 } },
        { t: 'Music that enchants every listener', w: { shadhavar: 3, karkadann: 1 } },
        { t: 'A horn that never breaks', w: { karkadann: 3, monoceros: 2 } }
      ]
    }
  ];

  window.BEASTS = BEASTS;
  window.BEAST_REGIONS = REGIONS;
  window.BEAST_QUIZ = BEAST_QUIZ;
})();
