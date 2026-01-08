# Claude Code Configuration

This directory contains configuration files and documentation for Claude Code integration.

## Files Overview

### `settings.local.json`
Claude Code configuration file containing:
- **Permissions**: Tool usage permissions for automated operations
- **Custom Settings**: Local project-specific settings

Current permissions:
- `Bash(npx tsc:*)` - Allows automatic TypeScript compilation checks

### `PROJECT.md`
Comprehensive project documentation that is automatically maintained:
- **Auto-updated**: Last updated date refreshes on every commit
- **Content**: Project structure, tech stack, features, routes, and recent changes
- **Purpose**: Provides context to Claude Code about the project

### `update-project-changes.sh`
Helper script to add entries to the "Recent Changes" section in PROJECT.md.

**Usage**:
```bash
./.claude/update-project-changes.sh "Your change description"
```

**Example**:
```bash
./.claude/update-project-changes.sh "Added new authentication feature"
```

This will add a new entry under Recent Changes with today's date.

## Git Hooks

### Pre-commit Hook (`.git/hooks/pre-commit`)
Automatically updates the "Last Updated" timestamp in PROJECT.md before each commit.

**What it does**:
1. Gets the current date in YYYY-MM-DD format
2. Updates the `> **Last Updated**:` line in PROJECT.md
3. Stages the updated PROJECT.md file
4. Allows the commit to proceed

**Output**:
```
✅ Updated PROJECT.md with date: 2025-11-06
```

## How to Update Project Documentation

### Automatic Updates (Timestamp)
The last updated date is **automatically updated** on every commit via the pre-commit hook. No action needed.

### Manual Updates (Recent Changes)
When you make significant changes to the project:

1. Use the helper script:
   ```bash
   ./.claude/update-project-changes.sh "Description of your changes"
   ```

2. Or manually edit `.claude/PROJECT.md`:
   - Find the `## Recent Changes` section
   - Add a new subsection with today's date
   - List your changes with checkmarks (✅)

Example:
```markdown
## Recent Changes

### 2025-11-06
- ✅ Added template management feature
- ✅ Implemented localStorage persistence
- ✅ Created git hooks for auto-documentation
```

## Best Practices

1. **Keep PROJECT.md up to date**: Update the Recent Changes section when you add new features
2. **Don't edit timestamps manually**: Let the git hook handle the "Last Updated" field
3. **Use descriptive change entries**: Be specific about what was added, fixed, or changed
4. **Update structure documentation**: When adding new directories or files, update the project structure section

## Permissions Management

To add new automatic permissions for Claude Code, edit `settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npx tsc:*)",
      "Bash(npm run build:*)"
    ]
  }
}
```

Supported patterns:
- `Bash(command:*)` - Allow specific bash commands
- `Write(path/to/file)` - Allow writing to specific files
- `Read(path/to/*)` - Allow reading files in a directory

## Troubleshooting

### Hook not executing
If the pre-commit hook isn't running:
```bash
# Make sure it's executable
chmod +x .git/hooks/pre-commit

# Verify the file exists
ls -la .git/hooks/pre-commit
```

### Date not updating
Check the hook output during commit:
```bash
git commit -m "test"
# Should see: ✅ Updated PROJECT.md with date: YYYY-MM-DD
```

### Script not found
Make sure you're in the project root:
```bash
cd /path/to/carel-gpt
./.claude/update-project-changes.sh "test"
```

## Additional Resources

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
