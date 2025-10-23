#!/usr/bin/env python3
"""
Script to replace console.log/error/warn/info with logger utility
Excludes logger.ts itself and errorHandler.ts
"""

import os
import re
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_SRC = PROJECT_ROOT / "frontend" / "src"

# Files to exclude
EXCLUDE_FILES = {"logger.ts", "errorHandler.ts"}

# Patterns to replace
REPLACEMENTS = {
    r'console\.log\(': 'logger.debug(',
    r'console\.info\(': 'logger.info(',
    r'console\.warn\(': 'logger.warn(',
    r'console\.error\(': 'logger.error(',
}

def calculate_relative_import(file_path: Path) -> str:
    """Calculate relative import path from file to logger.ts"""
    logger_path = FRONTEND_SRC / "utils" / "logger.ts"

    # Get relative path
    try:
        rel_path = os.path.relpath(logger_path, file_path.parent)
        # Remove .ts extension and fix path separators
        rel_path = rel_path.replace('\\', '/').replace('.ts', '')

        # Ensure it starts with ./  or ../
        if not rel_path.startswith('.'):
            rel_path = './' + rel_path

        return rel_path
    except ValueError:
        # Fallback to absolute import if relative path fails
        return '../utils/logger'

def has_console_statements(content: str) -> bool:
    """Check if file contains console statements"""
    return bool(re.search(r'console\.(log|info|warn|error)\(', content))

def has_logger_import(content: str) -> bool:
    """Check if file already imports logger"""
    return bool(re.search(r"from\s+['\"].*utils/logger['\"]", content))

def add_logger_import(content: str, file_path: Path) -> str:
    """Add logger import after last import statement"""
    if has_logger_import(content):
        return content

    # Find last import line
    lines = content.split('\n')
    last_import_idx = -1

    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import_idx = i

    if last_import_idx == -1:
        # No imports, add at beginning
        rel_path = calculate_relative_import(file_path)
        return f"import {{ logger }} from '{rel_path}'\n\n{content}"

    # Insert after last import
    rel_path = calculate_relative_import(file_path)
    lines.insert(last_import_idx + 1, f"import {{ logger }} from '{rel_path}'")

    return '\n'.join(lines)

def replace_console_statements(content: str) -> tuple[str, int]:
    """Replace all console statements with logger"""
    changes = 0
    for pattern, replacement in REPLACEMENTS.items():
        new_content, count = re.subn(pattern, replacement, content)
        content = new_content
        changes += count

    return content, changes

def process_file(file_path: Path) -> tuple[bool, int]:
    """Process a single file. Returns (modified, changes_count)"""
    if file_path.name in EXCLUDE_FILES:
        return False, 0

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if not has_console_statements(content):
            return False, 0

        # Add import if needed
        content = add_logger_import(content, file_path)

        # Replace console statements
        content, changes = replace_console_statements(content)

        if changes > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes

        return False, 0

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0

def main():
    print("🔍 Finding TypeScript/TSX files with console statements...")

    total_files = 0
    total_changes = 0
    modified_files = []

    # Find all .ts and .tsx files
    for ext in ['*.ts', '*.tsx']:
        for file_path in FRONTEND_SRC.rglob(ext):
            modified, changes = process_file(file_path)

            if modified:
                total_files += 1
                total_changes += changes
                rel_path = file_path.relative_to(PROJECT_ROOT)
                modified_files.append((rel_path, changes))
                print(f"  ✅ {rel_path} ({changes} replacements)")

    print(f"\n📊 Summary:")
    print(f"  Files modified: {total_files}")
    print(f"  Total replacements: {total_changes}")

    if modified_files:
        print(f"\n📝 Modified files:")
        for file_path, changes in modified_files:
            print(f"  - {file_path} ({changes} changes)")

    print(f"\n✅ Done! Run 'npm run build' in frontend to verify.")

if __name__ == "__main__":
    main()
