"""Re-inline diagrams-tdt.js and diagrams-tdt.css (the five "Where it's going" diagrams, redrawn on 22 Oct 2026
by the GPT session that drew the site's pictograms) into tower-tools-hub.html, between the /*TDTDIAGRAMS*/ and
/*TDTCSS*/ markers. Run it after editing either file, then make_public.py and make_site.py."""
from pathlib import Path
here = Path(__file__).parent
h = here / "tower-tools-hub.html"; t = h.read_text(encoding="utf-8")
for start, end, src in (("/*TDTDIAGRAMS*/", "/*/TDTDIAGRAMS*/", "diagrams-tdt.js"), ("/*TDTCSS*/", "/*/TDTCSS*/", "diagrams-tdt.css")):
    i = t.index(start); j = t.index(end)
    t = t[:i] + start + "\n" + (here / src).read_text(encoding="utf-8").strip() + "\n" + t[j:]
h.write_text(t, encoding="utf-8")
print("inlined diagrams-tdt.js and diagrams-tdt.css")
