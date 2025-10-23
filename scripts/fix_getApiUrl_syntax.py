#!/usr/bin/env python3
"""
Script to fix incorrectly formatted getApiUrl() calls
Fixes: `getApiUrl('/path')` -> getApiUrl('/path')
"""

import re
import os
from pathlib import Path

def fix_getApiUrl_syntax(file_path):
    """Fix getApiUrl syntax errors"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix pattern: `getApiUrl('/...')` or `getApiUrl("/...")`
    # Should be: getApiUrl('/...')
    content = re.sub(r"`getApiUrl\((['\"])([^'\"]+)\1\)`", r"getApiUrl(\1\2\1)", content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        # Count number of fixes
        fixes = len(re.findall(r"`getApiUrl\((['\"])([^'\"]+)\1\)`", original_content))
        return fixes
    return 0

def main():
    frontend_dir = Path('frontend/src/components')

    if not frontend_dir.exists():
        print("❌ Frontend components directory not found")
        return

    print("🔍 Fixing getApiUrl() syntax errors...")

    files_modified = 0
    total_fixes = 0

    # Find all TypeScript files
    for ts_file in frontend_dir.rglob('*.tsx'):
        fixes = fix_getApiUrl_syntax(ts_file)
        if fixes > 0:
            files_modified += 1
            total_fixes += fixes
            rel_path = ts_file.relative_to(Path('.'))
            print(f"  ✅ {rel_path} ({fixes} fixes)")

    print(f"\n📊 Summary:")
    print(f"  Files modified: {files_modified}")
    print(f"  Total fixes: {total_fixes}")

if __name__ == '__main__':
    main()
