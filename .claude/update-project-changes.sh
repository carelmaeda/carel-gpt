#!/bin/bash
#
# Helper script to update the "Recent Changes" section in PROJECT.md
# Usage: ./.claude/update-project-changes.sh "Your change description"
#

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Change description\""
    echo "Example: $0 \"Added new email template feature\""
    exit 1
fi

CHANGE_DESC="$1"
CURRENT_DATE=$(date +%Y-%m-%d)
PROJECT_FILE=".claude/PROJECT.md"

if [ ! -f "$PROJECT_FILE" ]; then
    echo "Error: $PROJECT_FILE not found"
    exit 1
fi

# Create a temporary file with the new change entry
TEMP_FILE=$(mktemp)

# Find the "## Recent Changes" section and add the new entry
awk -v date="$CURRENT_DATE" -v desc="$CHANGE_DESC" '
    /^## Recent Changes/ {
        print $0
        print ""
        print "### " date
        print "- ✅ " desc
        skip_next_blank = 1
        next
    }
    skip_next_blank && /^$/ {
        skip_next_blank = 0
        next
    }
    { print }
' "$PROJECT_FILE" > "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$PROJECT_FILE"

echo "✅ Added change to PROJECT.md: $CHANGE_DESC"
echo "📝 Don't forget to commit this change!"
