I've built **Unicornis**, a five-page unicorn website in `E:\tmp\unicorns\opus-max\work`, with `index.html` as the entry page :) It opens directly from the folder with no build step or server. All illustrations are original SVG drawn in code. The only thing loaded from the web is Google Fonts, and it falls back to system fonts offline.

**Pages**
- **Home:** a unicorn drawn as a constellation that animates in over a twinkling night sky. Also: where the word comes from, six true facts, cards linking to the other pages, a crystal orb that gives a random fact (27 in total), and an FAQ.
- **Legends:** a zigzag timeline in four eras, from Indus Valley seals (c. 2600 BCE) to 2018, with a sticky era bar. Includes a feature on how narwhal tusks were sold as unicorn horn.
- **Bestiary:** 14 unicorns from myth and nature, each shown by its horn. You can filter by type or region, search, and open detailed notes. One creature, the shadhavar, has a "Play the horn" button that makes a sound. There's also a "Which unicorn are you?" quiz; I checked all 4,096 answer combinations and every creature can win.
- **Atelier:** a build-your-own unicorn tool (coat, mane, horn, eyes, markings, wings, accessories, background) with a name generator and a personality card. You can download a PNG, copy a share link, and save unicorns to a "stable" kept in your browser.
- **Night Sky:** a clickable map of the unicorn constellation, Monoceros, built from real star positions, with its nebulae and clusters and the Winter Triangle. You can draw your own constellation lines, and there's a guide to finding it in the real sky.

**Testing**
- I ran every page in headless Chrome at desktop and phone width (390px) and clicked through the interactive parts by script. No console errors, no sideways scrolling, and all internal links and anchors resolve.
- Reduced-motion settings work: animations stop and everything stays visible.
- It's keyboard accessible: visible focus styles, a skip link, and a proper dialog with focus return.
- I did not test Firefox or Safari.
- PNG download falls back to an SVG file, and "Copy link" falls back to putting the link in the address bar, if the browser blocks either. I didn't trigger those fallbacks myself.

**Fact accuracy:** the history and science text was written from my own knowledge and not checked against sources online. Where I wasn't sure, the wording is hedged ("some tales say", "reportedly").

There's also a typing easter egg: type "unicorn" on any page.
