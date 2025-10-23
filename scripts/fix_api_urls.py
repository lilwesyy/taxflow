#!/usr/bin/env python3
"""
Script to replace hardcoded API URLs with centralized config
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_SRC = PROJECT_ROOT / "frontend" / "src"

EXCLUDE_FILES = {"api.ts"}  # Don't modify config file itself

# Patterns to find and replace
PATTERNS = [
    # Pattern: const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    {
        'find': r"const\s+API_URL\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|\s*['\"]https?://localhost:\d+(?:/api)?['\"]",
        'replace_with_import': True,
        'usage': 'getApiUrl'
    },
    # Pattern: const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'
    {
        'find': r"const\s+apiBaseUrl\s*=\s*import\.meta\.env\.VITE_API_URL\?\.replace\(['\"]\/api['\"]\s*,\s*['\"]['\"].*?\|\|\s*['\"]https?://localhost:\d+['\"]",
        'replace_with_import': True,
        'usage': 'getBaseUrl'
    },
    # Pattern: `${API_URL}/endpoint` -> getApiUrl('/endpoint')
    {
        'find': r'\$\{API_URL\}(/[^`]+)',
        'replace': r"getApiUrl('\1')",
        'needs_import': True
    },
    # Pattern: `${apiBaseUrl}/uploads/...` -> `${getBaseUrl()}/uploads/...`
    {
        'find': r'\$\{apiBaseUrl\}(/uploads/[^`]+)',
        'replace': r"${getBaseUrl()}\1",
        'needs_import': True
    }
]

def has_api_import(content: str) -> bool:
    """Check if file already imports from config/api"""
    return bool(re.search(r"from\s+['\"].*config/api['\"]", content))

def calculate_relative_import(file_path: Path) -> str:
    """Calculate relative import path from file to config/api.ts"""
    config_path = FRONTEND_SRC / "config" / "api.ts"

    try:
        rel_path = os.path.relpath(config_path, file_path.parent)
        rel_path = rel_path.replace('\\', '/').replace('.ts', '')

        if not rel_path.startswith('.'):
            rel_path = './' + rel_path

        return rel_path
    except ValueError:
        return '../config/api'

def add_api_imports(content: str, file_path: Path, needs: set) -> str:
    """Add necessary imports from config/api"""
    if has_api_import(content):
        # Already has import, might need to add more functions
        import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"].*config/api['\"]", content)
        if import_match:
            current_imports = {i.strip() for i in import_match.group(1).split(',')}
            all_imports = current_imports | needs
            new_import_line = f"import {{ {', '.join(sorted(all_imports))} }} from '../config/api'"
            content = re.sub(
                r"import\s+\{[^}]+\}\s+from\s+['\"].*config/api['\"]",
                new_import_line,
                content
            )
        return content

    # Add new import
    lines = content.split('\n')
    last_import_idx = -1

    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import_idx = i

    rel_path = calculate_relative_import(file_path)
    import_line = f"import {{ {', '.join(sorted(needs))} }} from '{rel_path}'"

    if last_import_idx == -1:
        return f"{import_line}\n\n{content}"

    lines.insert(last_import_idx + 1, import_line)
    return '\n'.join(lines)

def process_file(file_path: Path) -> tuple[bool, int]:
    """Process a single file. Returns (modified, changes_count)"""
    if file_path.name in EXCLUDE_FILES:
        return False, 0

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes = 0
        needs_imports = set()

        # Remove old API_URL constants
        if re.search(r"const\s+API_URL\s*=\s*import\.meta\.env\.VITE_API_URL", content):
            content = re.sub(
                r"const\s+API_URL\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|\s*['\"]https?://[^'\"]+['\"]\s*\n?",
                "",
                content
            )
            needs_imports.add('getApiUrl')
            changes += 1

        if re.search(r"const\s+apiBaseUrl\s*=\s*import\.meta\.env\.VITE_API_URL", content):
            content = re.sub(
                r"const\s+apiBaseUrl\s*=\s*import\.meta\.env\.VITE_API_URL.*?\n",
                "",
                content
            )
            needs_imports.add('getBaseUrl')
            changes += 1

        # Replace ${API_URL}/path with getApiUrl('/path')
        matches = list(re.finditer(r'\$\{API_URL\}(/[^`}]+)', content))
        if matches:
            for match in reversed(matches):  # Reverse to maintain indices
                path = match.group(1)
                content = content[:match.start()] + f"getApiUrl('{path}')" + content[match.end():]
                needs_imports.add('getApiUrl')
                changes += 1

        # Replace ${apiBaseUrl}/... with ${getBaseUrl()}/...
        if '${apiBaseUrl}' in content:
            content = re.sub(r'\$\{apiBaseUrl\}', '${getBaseUrl()}', content)
            needs_imports.add('getBaseUrl')
            changes += 1

        # Add imports if needed
        if needs_imports:
            content = add_api_imports(content, file_path, needs_imports)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes

        return False, 0

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0

def main():
    print("🔍 Finding files with hardcoded API URLs...")

    total_files = 0
    total_changes = 0
    modified_files = []

    for ext in ['*.ts', '*.tsx']:
        for file_path in FRONTEND_SRC.rglob(ext):
            modified, changes = process_file(file_path)

            if modified:
                total_files += 1
                total_changes += changes
                rel_path = file_path.relative_to(PROJECT_ROOT)
                modified_files.append((rel_path, changes))
                print(f"  ✅ {rel_path} ({changes} changes)")

    print(f"\n📊 Summary:")
    print(f"  Files modified: {total_files}")
    print(f"  Total changes: {total_changes}")

    if modified_files:
        print(f"\n📝 Modified files:")
        for file_path, changes in modified_files:
            print(f"  - {file_path} ({changes} changes)")

    print(f"\n✅ Done! Run 'npm run build' in frontend to verify.")

if __name__ == "__main__":
    main()
