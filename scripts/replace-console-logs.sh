#!/bin/bash

# Script to replace console.log/error/warn with logger utility
# Run from project root

echo "🔍 Replacing console statements with logger utility..."

cd "$(dirname "$0")/.." || exit

# Find all TypeScript/TSX files excluding logger.ts itself
FILES=$(find frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "logger.ts")

for file in $FILES; do
    # Check if file contains console statements
    if grep -q "console\." "$file"; then
        echo "📝 Processing: $file"

        # Check if file already imports logger
        if ! grep -q "from.*utils/logger" "$file" && ! grep -q "from.*@/utils/logger" "$file"; then
            # Calculate relative path to utils/logger.ts
            file_dir=$(dirname "$file")
            relative_path=$(realpath --relative-to="$file_dir" "frontend/src/utils/logger.ts" | sed 's/\.ts$//')

            # Add import at the top of the file (after existing imports)
            # Find the last import line
            last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

            if [ -n "$last_import_line" ]; then
                # Insert after last import
                sed -i "${last_import_line}a import { logger } from '${relative_path}'" "$file"
            else
                # No imports found, add at the beginning
                sed -i "1i import { logger } from '${relative_path}'" "$file"
            fi
        fi

        # Replace console statements
        sed -i 's/console\.log(/logger.debug(/g' "$file"
        sed -i 's/console\.info(/logger.info(/g' "$file"
        sed -i 's/console\.warn(/logger.warn(/g' "$file"
        sed -i 's/console\.error(/logger.error(/g' "$file"
    fi
done

echo "✅ Done! Replaced console statements in $(echo "$FILES" | grep -c "console\." || echo "0") files"
echo "🧪 Run 'npm run build' to verify changes"
