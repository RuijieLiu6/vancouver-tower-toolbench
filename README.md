# Tower Design Toolkit — website

Small tools for designing a high-rise in Vancouver, by Ruijie Liu and Sinnie Choi (ARCH 540, UBC SALA, fall 2026, studio instructor Xun Liu).

**Live site:** https://ruijieliu6.github.io/vancouver-tower-toolbench/ (add `#tour` to the address to start the guided tour).

The site opens on an interactive model of downtown Vancouver, then has four tabs: About us, How it works, Try the tools and Give feedback. A guided tour follows the presentation script stop by stop.

## How it is built

The whole page is one source file, `tower-tools-hub.html`. On every push to `main`, GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) runs the build and publishes the result to GitHub Pages, usually within a minute:

| Step | What it does |
|---|---|
| `python3 make_figure.py` | Inlines the downtown model (`figure-src/downtown.html`) into the landing |
| `python3 inject_v2.py` | Inlines the research diagrams (`diagrams-v2.js`) |
| `python3 inject_tdt.py` | Inlines the toolkit diagrams (`diagrams-tdt.js`, `diagrams-tdt.css`) |
| `python3 make_public.py` | Makes the public copy |
| `python3 make_site.py <url>` | Writes the website to `site/` |

`site/` and `public/` are build output: never edit them by hand, and they are not in the repository.

## Making a change

1. **Make a branch.** On github.com you can edit a file and choose "Create a new branch" when you commit. Locally: `git switch -c my-change`.
2. **Edit the source.**

   | To change | Edit |
   |---|---|
   | Text, layout, styles, tool cards, the guided tour, the feedback form | `tower-tools-hub.html` |
   | The research diagrams (how a tower is designed today, where today's tools stop, who does what) | `diagrams-v2.js` |
   | The "How the toolkit runs" diagrams | `diagrams-tdt.js`, `diagrams-tdt.css` |
   | The downtown model on the landing | `figure-src/` (see its `HANDOFF.md`) |
   | Pictures | `images/` |

3. **Preview it** (needs Python 3 only):

   ```bash
   python3 make_figure.py && python3 inject_v2.py && python3 inject_tdt.py && python3 make_public.py && python3 make_site.py https://ruijieliu6.github.io/vancouver-tower-toolbench/
   python3 -m http.server 8031 --directory site
   ```

   Then open http://localhost:8031/ (or http://localhost:8031/#tour).
4. **Open a pull request.** Once it is merged into `main`, the site republishes by itself.

**Presenting.** The **Present** button at the right of the tab bar (or `#present` in the address) shows the talk as slides on the page itself: each slide switches to the right tab, scrolls its section or figure into view and dims everything else, walking About us, How it works and Try the tools in order (`PRESENT` at the end of `tower-tools-hub.html`); the page is frozen while presenting, and the notes are the presentation script where it has words for a slide, otherwise the section's own text. Arrow keys or a clicker move between slides, N shows the notes, F asks for full screen, Esc leaves.

## Rules for every change

- **The tour follows the script.** The tour's stops are the `TOUR` list in `tower-tools-hub.html`, in the same order as the `[Tour n]` cues in the presentation script. Change one, change the other.
- **Keep the style.** The site follows the Tower Design Toolkit app's design system ([DESIGN_HANDOFF.md](https://github.com/RuijieLiu6/tower-design-toolkit/blob/main/DESIGN_HANDOFF.md)): Inter, paper `#f6f5f2`, white panels, hairlines `#e3e1dc`, accent `#1f5f8b`. Colours are CSS variables at the top of the stylesheet; use them instead of new colours.
- **No competition base model data.** Never add anything derived from the Vancouver Tall Challenge base model (it belongs to Buildner).
- **Credit people and sources.** Keep the photo licences in the captions and the OpenStreetMap notice on the landing.
- **Study tools, not compliance checks.** Keep the "study tool" limits on every tool card.

## Credits

- Vista and the Program Value Visualizer: Ruijie Liu. Downtown Massing Tool: Sinnie Choi. Tower Design Toolkit: Ruijie Liu and Sinnie Choi.
- Downtown model built from OpenStreetMap data (© OpenStreetMap contributors, ODbL).
- Photographs from Wikimedia Commons, under the licences named on the page: Jonathanfv (CC BY 3.0), Ian Spence (CC BY 3.0), Northwest (CC BY 4.0), W & J (CC BY-SA 2.0), Klazu (CC BY-SA 4.0), Kyle Pearce / DIY Genius (CC BY-SA 2.0). Resized for the web.
- Document covers are shown as small cited thumbnails: Vancouver Tall Challenge competition conditions; City of Vancouver Public Views Guidelines; Adebar, DeVall & Mutrie (2017), Structural Engineering International; Liu & Tian (2025).
- Pictograms drawn with GPT image generation; built with help from Claude (Anthropic). Research drafted with a GPT model and peer-reviewed with Claude.

These are study tools for early design. They do not check compliance, size structure or prove feasibility.
