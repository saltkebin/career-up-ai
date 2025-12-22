# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**キャリアアップ助成金 申請支援アプリ** - A web application to support labor consultants (社労士) with Career-Up Grant (正社員化コース) applications using generative AI.

**Status:** 🚧 Planning Phase (企画・設計フェーズ) - No implementation code exists yet.

**Target Users:**
- Primary: Labor consultant firms (社労士事務所)
- Secondary: Client companies applying for grants

## Planned Features

1. **図解生成 (Diagram Generation)** - Auto-generate visual explanations of the grant system for companies
2. **書類チェック (Document Validation)** - AI-powered detection of defects/omissions in submitted documents
3. **書類作成 (Document Generation)** - Auto-generate application forms from input data

## Domain Context

This project deals with キャリアアップ助成金 (Career-Up Grant), specifically the 正社員化コース (permanent employment conversion course). Key domain knowledge is documented in `docs/career-up-grant-research.md`.

**Important constraints:**
- Strict 2-month application deadline after permanent employment conversion
- Severe penalties for fraud/errors - document accuracy is critical
- 2025 system changes introduced "重点支援対象者" (priority support targets) category

## Documentation Structure

```
docs/
├── career-up-grant-research.md  # Grant system details and requirements
├── sharoushi-workflow.md        # Labor consultant 5-phase workflow
├── development-plan.md          # MVP → Phase 3 roadmap with tech specs
├── project-concept.md           # Feature planning and UX concepts
└── discussion-log.md            # Decision log and meeting notes
```

## Web Research Permissions

This project has pre-approved WebFetch access for:
- `www.mhlw.go.jp` - Ministry of Health, Labour and Welfare (official grant information)
- `jsite.mhlw.go.jp` - Regional labor bureaus
- `sharoushi-cloud.com` - Labor consultant resources

## Language

All documentation and user-facing content is in **Japanese**. Code comments and technical documentation may be in English.

## Planned Tech Stack (MVP)

Based on `docs/development-plan.md`:

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:   Firebase (Auth, Firestore, Functions)
Hosting:   Vercel or Firebase Hosting
AI/ML:     Cloud Vision (OCR), GPT-4/Claude (document analysis)
```

## MVP Feature Scope

Three core tools targeting labor consultant pain points:

1. **賃金3%増額計算ツール** - Salary calculator to verify 3% raise requirement
2. **申請期限管理** - Deadline tracker with reminders (14/7/3/1 days before)
3. **対象者チェックリスト** - Worker eligibility checker + priority support classification (A/B/C)

## Data Model (Firestore)

Key collections: `/users`, `/offices`, `/clients`, `/workers`, `/applications`

See `docs/development-plan.md` for full schema with fields.

## Development Guidelines

- **Package Manager:** npm
- **TypeScript:** strict mode enabled
- All user-facing content in Japanese
- Code comments and technical docs may be in English

When implementation begins, add:
- Build/test/lint commands
- Architecture overview
- Key entry points
