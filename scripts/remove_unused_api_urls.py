#!/usr/bin/env python3
"""
Script to remove unused API_URL declarations from TypeScript files
"""

import re
import os
from pathlib import Path

def remove_unused_api_urls(file_path):
    """Remove unused API_URL const declarations"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern to match the API_URL declaration line
    patterns = [
        r'\s*const API_URL = import\.meta\.env\.VITE_API_URL \|\| [\'"][^\'"]+[\'"]\n',
        r'\s*const API_URL = import\.meta\.env\.VITE_API_URL \|\| \(import\.meta\.env\.PROD \? [\'"][^\'"]+[\'"] : [\'"][^\'"]+[\'"]\)\n',
    ]

    for pattern in patterns:
        content = re.sub(pattern, '', content)

    # Also remove unused getApiUrl imports if it's not used in the file
    if 'getApiUrl(' not in content and 'import { getApiUrl }' in content:
        # Remove the import
        content = re.sub(r"import \{ getApiUrl \} from ['\"].*?['\"]\n", '', content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    frontend_dir = Path('frontend/src/components')

    if not frontend_dir.exists():
        print("❌ Frontend components directory not found")
        return

    print("🔍 Removing unused API_URL declarations...")

    files_modified = 0
    total_changes = 0

    # Find all TypeScript files
    for ts_file in frontend_dir.rglob('*.tsx'):
        if remove_unused_api_urls(ts_file):
            files_modified += 1
            rel_path = ts_file.relative_to(Path('.'))
            print(f"  ✅ {rel_path}")

    print(f"\n📊 Summary:")
    print(f"  Files modified: {files_modified}")

if __name__ == '__main__':
    main()
