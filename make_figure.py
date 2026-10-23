"""Inline the interactive downtown figure (figure-src/downtown.html) into tower-tools-hub.html.

Since 22 Oct 2026 the figure is the site's full-bleed landing: it sits inside <section id="landing">,
with no card frame, and clicking "our building" enters the site. The landing layout and the
enter behaviour live in the site's own CSS and script, so this build only supplies the figure.

It writes two blocks, both re-runnable:
  <!--DTFIG--> ... <!--/DTFIG-->  the figure itself (scoped CSS, markup, live script), in the landing
  <!--DTCAP--> ... <!--/DTCAP-->  "How the towers were drawn", in the About us tab
The figure scopes its page-wide CSS to .dtfig, wraps its script, and syncs light/dark with the site.
"""
import re
from pathlib import Path
here = Path(__file__).parent
src = (here / "figure-src" / "downtown.html").read_text(encoding="utf-8")
css = "\n".join(re.findall(r"<style>(.*?)</style>", src, re.S))
css = re.sub(r"(^|})\s*\*\{box-sizing:border-box\}", r"\1 .dtfig *{box-sizing:border-box}", css)
css = re.sub(r"(^|})\s*html\{[^}]*\}", r"\1", css)
css = re.sub(r"(^|})\s*body(\[[^\]]*\])?\{[^}]*\}", r"\1", css)
css += "\n.dtfig .iso-page{width:100%;max-width:none;margin:0}.dtfig .iso-figure{margin:0}.dtfig{background:transparent}"
body = re.search(r"<body[^>]*>(.*)</body>", src, re.S).group(1)
scripts = re.findall(r"<script[^>]*>(.*?)</script>", body, re.S)
markup = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.S)
cap = re.search(r'<span class="iso-caption">(.*?)</span>', markup, re.S)
cap_html = cap.group(1) if cap else ""
if cap: markup = markup.replace(cap.group(0), "", 1)
# the page already has its own <main>; the figure's wrapper becomes a plain div
markup = markup.replace('<main class="iso-page">', '<div class="iso-page">', 1).replace("</main>", "</div>", 1)
js = "\n".join(scripts)
frag = f"""<!--DTFIG-->
<div class="dtfig-wrap">
<style>{css}</style>
<div class="iso dtfig" data-theme="light">{markup}</div>
<script>
(function () {{
  const fig = document.querySelector('.dtfig');
  const sync = () => {{ const r = document.documentElement.dataset.theme; fig.dataset.theme = r === 'dark' || (r !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }};
  sync(); if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, {{ attributes: true, attributeFilter: ['data-theme'] }});
}})();
(function () {{
{js}
}})();
</script>
</div>
<!--/DTFIG-->"""
capblock = f"""<!--DTCAP-->
<details class="more dtfig-more"><summary>How the towers on the landing page were drawn</summary><p>{cap_html}</p></details>
<!--/DTCAP-->"""
hub = here / "tower-tools-hub.html"; t = hub.read_text(encoding="utf-8")
for start, end, block in (("<!--DTFIG-->", "<!--/DTFIG-->", frag), ("<!--DTCAP-->", "<!--/DTCAP-->", capblock)):
    if start not in t:
        raise SystemExit(f"missing {start} marker: the landing (<!--DTFIG-->) and About us (<!--DTCAP-->) slots must exist")
    t = re.sub(re.escape(start) + r".*?" + re.escape(end), lambda m: block, t, count=1, flags=re.S)
hub.write_text(t, encoding="utf-8")
print("figure inlined:", len(frag), "bytes; caption block:", len(capblock), "bytes")
