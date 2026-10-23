"""Build the public copy of the Toolbench from tower-tools-hub.html (the team copy).
The public copy declares no capabilities: anyone with the link can open it; feedback goes to the Google Form.
Run: python3 make_public.py  -> public/vancouver-tower-toolbench.html (+ images, diagrams)."""
import shutil
from pathlib import Path
here = Path(__file__).parent
out = here / "public"; out.mkdir(exist_ok=True)
t = (here / "tower-tools-hub.html").read_text(encoding="utf-8")
for a, b in [("<title>Original Website</title>", "<title>Tower Design Toolkit Presentation Board</title>"),
             ("/* IS_PUBLIC is set to true only in the public copy (built by make_public.py). */", "/* IS_PUBLIC is set to true only in the public copy (built by make_public.py). This claude.ai copy saves feedback to the shared database. */")]:
    assert a in t, a; t = t.replace(a, b, 1)
(out / "vancouver-tower-toolbench.html").write_text(t, encoding="utf-8")
for d in ("images", "diagrams"):
    shutil.copytree(here / d, out / d, dirs_exist_ok=True)
print("built", out / "vancouver-tower-toolbench.html")
