---
name: github
description: Usar GitHub CLI para PRs, issues y Actions
---

# GitHub CLI

Usa siempre el comando gh. Verifica con gh auth status.

## PRs

- gh pr list
- gh pr create --title "titulo" --body "descripcion"
- gh pr view <numero>
- gh pr merge <numero> --squash

## Issues

- gh issue list
- gh issue create --title "titulo" --body "descripcion"
- gh issue close <numero>

## Actions

- gh run list
- gh run view <id> --log
  ENDOFFILE
