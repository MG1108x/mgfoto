"""Create responsive WebP files and build metadata, leaving source photos untouched.
Run before build-gallery.js. Requires Pillow 11.3.0.
"""
import json
import re
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
extensions = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
excluded = re.compile(r'^(og-image|favicon|apple-touch-icon|icon-\d+|logo)', re.I)
sources = sorted(p for p in (root / 'images').rglob('*')
                 if p.is_file() and p.suffix.lower() in extensions
                 and not any(part.startswith('.') for part in p.relative_to(root).parts)
                 and not excluded.match(p.name))
variants = {}
expected_paths = set()
for source in sources:
    key = source.relative_to(root).as_posix()
    variants[key] = {}
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert('RGB')
        for label, width in [('small', 640), ('large', 1600)]:
            copy = image.copy()
            copy.thumbnail((width, width), Image.Resampling.LANCZOS)
            relative = source.relative_to(root / 'images')
            target = root / 'assets' / 'photos' / relative.parent / (source.name + '.' + label + '.webp')
            expected_paths.add(target)
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_name(target.name + '.tmp')
            try:
                copy.save(temporary, 'WEBP', quality=82, method=4)
                temporary.replace(target)
            finally:
                temporary.unlink(missing_ok=True)
            variants[key][label] = target.relative_to(root).as_posix()
        variants[key]['width'], variants[key]['height'] = image.size
# Prune generated copies after a source photo is removed.
photos_dir = root / 'assets' / 'photos'
removed = 0
for pattern in ('*.small.webp', '*.large.webp'):
    for target in photos_dir.rglob(pattern):
        if target not in expected_paths:
            target.unlink()
            removed += 1
(root / 'photo-metadata.json').write_text(json.dumps(variants, ensure_ascii=False, indent=2) + '\n')
print(f'{len(variants)} photographs optimized; {removed} obsolete web copies removed.')
