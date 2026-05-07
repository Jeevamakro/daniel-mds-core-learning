---
name: smart-commit
description: Analyze code changes and generate a clear, descriptive Git commit message before pushing to GitHub. Use this skill whenever the user wants to commit, push, save, or upload changes to GitHub. Trigger phrases include "push to github", "commit changes", "save my work", "upload to repo", "push code".
---

# Smart Commit & Push Skill

## Purpose
Automatically analyze what changed in the project, write a clear and descriptive commit message, then push to GitHub — so the GitHub history is meaningful and easy to track.

## When to Use
Trigger this skill when the user says any of:
- "push to github"
- "commit and push"
- "save my changes"
- "upload my work"
- "push code"
- "commit changes"

## Steps to Follow

### Step 1: Check Git Status
Run: `git status`

This shows:
- Which files were modified
- Which files were added
- Which files were deleted

### Step 2: Review Actual Changes
Run: `git diff` (for modified files)
Run: `git diff --cached` (if already staged)

Read the actual code differences to understand WHAT changed, not just WHICH files changed.

### Step 3: Analyze and Categorize Changes
Group the changes into one of these categories:
- **feat**: New feature added
- **fix**: Bug fix
- **style**: CSS/UI/design changes only
- **refactor**: Code restructured without changing behavior
- **docs**: Documentation only (CLAUDE.md, README, comments)
- **chore**: Config, dependencies, build files
- **perf**: Performance improvements

### Step 4: Generate Commit Message

Use this format:


<type>: <short summary in 50 chars or less>

<detailed description of what changed and why>

Changes:
- Specific change 1
- Specific change 2
- Specific change 3


**Rules:**
- First line: under 50 characters, present tense ("add" not "added")
- Blank line after first line
- Bullet points listing exact changes
- Mention files modified if helpful
- Be specific — say WHAT changed, not just "updated files"

### Step 5: Show Message to User First
Display the generated commit message and ask:

"Here's the commit message I prepared:

[show message]

Should I proceed with this commit and push? (yes / edit / cancel)"

Wait for user approval before committing.

### Step 6: Stage, Commit, and Push
Once approved, run:


git add .
git commit -m "<generated message>"
git push


### Step 7: Confirm Success
After push, show:
- ✅ Commit hash (short)
- ✅ Number of files changed
- ✅ Branch pushed to
- ✅ GitHub repo URL

## Example Outputs

### Example 1: New Feature

feat: add newsletter popup with email validation

Implemented a modal popup that captures visitor emails for the newsletter.
Triggers after 5 seconds or 50% scroll, whichever comes first.

Changes:
- Added popup HTML markup at end of body in index.html
- Added .newsletter-popup styles with fade-in animation in style.css
- Added popup trigger logic with sessionStorage in script.js
- Added email validation and success message handling


### Example 2: Bug Fix

fix: resolve mobile navbar not closing on link click

Mobile hamburger menu stayed open after clicking nav links,
forcing users to manually close it before scrolling.

Changes:
- Added click handler on nav links in script.js
- Toggle .nav--open class off when any link is clicked
- Tested on mobile viewport (375px width)


### Example 3: Style Update

style: update hero section gradient and button hover

Refined the orange gradient direction and added smoother hover
transitions to match new design feedback.

Changes:
- Changed hero gradient angle from 135deg to 120deg in style.css
- Added 0.3s ease transition to .btn--primary hover state
- Increased CTA button padding for better touch targets on mobile


### Example 4: Multiple Areas

feat: add contact form and update footer links

New contact form section between About and Footer.
Footer social links updated with current accounts.

Changes:
- Added <section id="contact"> with form fields in index.html
- Added .contact-form styles with orange gradient submit button
- Added form validation logic in script.js
- Updated footer social icons (Twitter → X, removed inactive Dribbble)
- Updated nav with new "Contact" link pointing to #contact


## Important Rules

- ✅ ALWAYS check `git status` and `git diff` before writing the message
- ✅ ALWAYS show the message to user for approval before committing
- ✅ Be specific — never use vague messages like "updated files" or "made changes"
- ✅ Mention specific filenames and what changed in them
- ❌ NEVER auto-commit without showing the message first
- ❌ NEVER write generic messages like "fix bugs" or "update code"
- ❌ NEVER push without committing first

## If Something Goes Wrong

If `git push` fails:
- If "no upstream branch": run `git push -u origin main`
- If "non-fast-forward": run `git pull --rebase` first, then push
- If authentication fails: tell user to log in via browser
- If merge conflicts: stop, explain the conflict, ask user how to proceed