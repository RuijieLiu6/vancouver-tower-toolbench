"""Build a standalone website (no Claude account needed) from the public copy.
Output: site/index.html + images/ + diagrams/, ready for any static host such as GitHub Pages.
Run: python3 make_public.py && python3 make_site.py [public-site-url]"""
import shutil, sys
from pathlib import Path
here = Path(__file__).parent
site = here / "site"; site.mkdir(exist_ok=True)
body = (here / "public" / "vancouver-tower-toolbench.html").read_text(encoding="utf-8")
url = sys.argv[1] if len(sys.argv) > 1 else None
if url:  # point the QR code and the Copy link button at the standalone site
    import re
    body, n = re.subn(r"const PUBLIC_URL = '[^']*';", f"const PUBLIC_URL = '{url}';", body, count=1)
    assert n == 1
body = body.replace("const IS_PUBLIC = false;", "const IS_PUBLIC = true;", 1)  # the GitHub site never uses claude.ai storage
body = body.replace("<title>Tower Design Toolkit Presentation Board</title>", "<title>Tower Design Toolkits</title>", 1)
head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="description" content="Small tools for designing a high-rise in Vancouver, by Ruijie Liu and Sinnie Choi (ARCH 540, UBC SALA).">'
        '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
(site / "index.html").write_text(head + body + "</body></html>", encoding="utf-8")
for d in ("images", "diagrams"):
    shutil.copytree(here / d, site / d, dirs_exist_ok=True)
(site / ".nojekyll").write_text("")
print("built", site / "index.html", "QR ->", url or "(unchanged)")
