"""Generate web-sized copies without altering originals. Requires Pillow.
Run from the repository root: python scripts/optimize-images.py
New/unoptimized images remain usable through the original-file fallback.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'images-manifest.json').read_text())
variants = {}
original_bytes = optimized_bytes = 0
for slug, files in manifest.items():
    if not isinstance(files, list):
        continue
    for name in files:
        source = root / 'images' / slug / name
        key = source.relative_to(root).as_posix()
        original_bytes += source.stat().st_size
        variants[key] = {}
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert('RGB')
            for label, width in [('small', 640), ('large', 1600)]:
                copy = image.copy()
                copy.thumbnail((width, width), Image.Resampling.LANCZOS)
                target = root / 'assets' / 'photos' / slug / (name + '.' + label + '.webp')
                target.parent.mkdir(parents=True, exist_ok=True)
                copy.save(target, 'WEBP', quality=82, method=4)
                optimized_bytes += target.stat().st_size
                variants[key][label] = target.relative_to(root).as_posix()
            variants[key]['width'], variants[key]['height'] = image.size
(root / 'assets/js').mkdir(parents=True, exist_ok=True)
(root / 'assets/js/image-variants.js').write_text('window.MG_IMAGE_VARIANTS = ' + json.dumps(variants, ensure_ascii=False, indent=2) + ';\n')
print(f'{len(variants)} photographs: {original_bytes / 1e6:.1f} MB originals, {optimized_bytes / 1e6:.1f} MB web copies (both sizes).')
