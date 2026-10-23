"""Write the edits made in the claude.ai copy's editor mode into tower-tools-hub.html.

Input: a JSON file holding the artifact database document "edits/current" (ArtifactData: collection "edits",
document "current"), or just its "items" map. Each item is {before, after}: a text block's original innerHTML
and its new one. A "before" must occur exactly once in the source, as HTML or inside a JavaScript string;
anything else is listed at the end for a hand edit.

Run: python3 apply_edits.py edits.json          (then rebuild, check, commit)"""
import json, re, sys
from pathlib import Path

here = Path(__file__).parent
src = here / "tower-tools-hub.html"
data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
items = data.get("items", data)
raw = src.read_bytes()
text = raw.decode("utf-8")


def variants(s):
    """The ways a block's innerHTML can appear in the source, each with the matching encoder for the new text."""
    yield s, (lambda a: a)
    js1 = lambda a: a.replace("\\", "\\\\").replace("'", "\\'")
    yield js1(s), js1
    js2 = lambda a: a.replace("\\", "\\\\").replace('"', '\\"')
    yield js2(s), js2
    ent = lambda a: a.replace("©", "&copy;")
    yield ent(s), ent


done, todo = [], []
for key, it in items.items():
    before, after = it["before"], it["after"]
    hit = None
    for v, enc in variants(before):
        n = text.count(v)
        if n == 1:
            hit = (v, enc(after))
            break
        if n > 1:
            # the same words can be a heading and a tour-stop title: prefer the one occurrence that is an HTML text node
            starts = [i for i in range(len(text)) if text.startswith(v, i)]
            in_html = [i for i in starts if i > 0 and text[i - 1] == ">" and text[i + len(v):i + len(v) + 1] == "<"]
            if len(in_html) == 1:
                i = in_html[0]
                text = text[:i] + enc(after) + text[i + len(v):]
                done.append((key, before, after))
                hit = "placed"
            else:
                todo.append((key, before, f"{n} matches"))
            break
    else:
        pat = re.compile(r"\s+".join(map(re.escape, before.split())))
        found = pat.findall(text)
        if len(found) == 1:
            hit = (found[0], after)
        else:
            todo.append((key, before, "not found" if not found else f"{len(found)} matches"))
    if hit and hit != "placed":
        text = text.replace(hit[0], hit[1], 1)
        done.append((key, before, after))

if text.encode("utf-8") != raw:
    src.write_bytes(text.encode("utf-8"))
print(f"applied {len(done)} edit(s) to {src.name}")
for key, b, a in done:
    print(f"  - {b[:70]!r}\n    -> {a[:70]!r}")
if todo:
    print(f"\n{len(todo)} edit(s) need a hand edit:")
    for key, b, why in todo:
        print(f"  - [{why}] {b[:90]!r}")
