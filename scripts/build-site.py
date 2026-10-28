"""Package static Pages assets with a consistent revision across module imports."""
from pathlib import Path
import datetime
import json
import os
import re
import shutil

root = Path(__file__).resolve().parent.parent
destination = root / 'dist'
revision = os.environ.get('GITHUB_SHA', 'local-build')
if destination.exists():
    shutil.rmtree(destination)
destination.mkdir()
for folder in ('assets', 'vendor'):
    shutil.copytree(root / folder, destination / folder)
for name in ('DESIGN.md', 'PRODUCT.md', 'docs/reviews/2026-10-27-barco-manual-v2.md'):
    target = destination / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(root / name, target)
for source in [root / 'index.html', root / 'style.css', root / '.nojekyll', root / 'generation-config.json', *root.glob('*.js')]:
    text = source.read_text()
    if source.suffix == '.js':
        text = re.sub(r"(from\s*['\"])(\./[^'\"]+\.js)(['\"])", lambda match: f'{match[1]}{match[2]}?v={revision}{match[3]}', text)
    if source.name == 'index.html':
        text = re.sub(r'((?:src|href)=")([^"?]+\.(?:js|css))(\")', lambda match: f'{match[1]}{match[2]}?v={revision}{match[3]}', text)
    (destination / source.name).write_text(text)
(destination / 'release.json').write_text(json.dumps({'version': revision, 'publishedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}))
print(f'Packaged {revision} in {destination}')
