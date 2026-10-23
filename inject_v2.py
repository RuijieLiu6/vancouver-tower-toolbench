"""Re-inline diagrams-v2.js into tower-tools-hub.html between the /*V2DIAGRAMS*/ markers."""
from pathlib import Path
here = Path(__file__).parent
h = here / "tower-tools-hub.html"; t = h.read_text(encoding="utf-8")
i = t.index("/*V2DIAGRAMS*/"); j = t.index("/*/V2DIAGRAMS*/")
h.write_text(t[:i] + "/*V2DIAGRAMS*/\n" + (here / "diagrams-v2.js").read_text(encoding="utf-8") + "\n" + t[j:], encoding="utf-8")
print("inlined diagrams-v2.js")
