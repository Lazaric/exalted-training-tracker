# 📘 Exalted 3e – Training & XP Tracker

## A Foundry VTT module for the Exalted Third Edition system (AppV2)

This module adds a dedicated **Training** tab to Exalted 3e character sheets for managing advancement, long-term training projects, and experience tracking.

Designed for campaigns where training time, advancement pacing, and XP management are an important part of play.

The module integrates cleanly with the existing Exalted 3e sheets without modifying core system files.

---

# ✨ Features

## 🎓 Dedicated Training Tab

Adds a fully integrated **Training** tab to Exalted 3e character sheets using Foundry VTT’s AppV2 sheet rendering.

The tab provides:
- XP pool summaries
- Training project management
- Time tracking
- Import/export tools
- Training completion workflow
- Planned future training entries

---

## 📚 Training Project Tracking

Create and manage training projects with:

- Name
- Description / notes
- XP source
- XP cost
- Total training days required
- Completed training days
- Creation date
- Completion date

Training time can be incremented quickly using:
- +1 day
- +7 days
- +28 days

Projects can be:
- Edited
- Deleted
- Completed
- Unlocked after completion

All actions generate styled chat notifications.

---

## 📝 Planned Training Entries

Training entries can use a special XP source "(planned)"

This marks them as **planned training** rather than active advancement.

Planned entries:
- Do not contribute to XP totals
- Cannot be incremented
- Cannot be completed
- Remain editable for future conversion into active projects

Useful for:
- Future Charm planning
- Long-term build tracking
- Story reward wishlists
- Martial Arts progression plans

---

# 📊 XP Tracking

The tracker supports:

- Standard XP
- Exalt XP
- Mandate XP (custom)
- Bonus Points (custom)

Each pool displays:
- Total
- Spent
- Available

XP totals are calculated automatically from active training entries.

The module intentionally hides the default Exalted 3e:
- Advancement section
- XP inputs
- Experience Changes list

to avoid duplicate tracking systems and conflicting edits.

---

# 👑 Storyteller XP Award Macro

The module exposes a Storyteller-facing API for awarding XP directly to player characters.

## Macro Command

Create a Script Macro with:

```js
game.modules.get("exalted-training-tracker")?.api?.openAwardExperienceDialog();
```

---

## Award Dialog Features

The award dialog allows the Storyteller to:

- Award Standard XP
- Award Exalt XP
- Award Mandate XP
- Select which player characters receive the award
- Exclude specific players from distribution

The submit button is automatically disabled unless:
- At least one XP type is greater than 0
- At least one recipient is selected

The module posts a formatted chat card summarising:
- XP awarded
- Recipients
- Awarding Storyteller

---

# 📅 Calendaria Integration

The module integrates with the **Calendaria** module for in-world campaign chronology and downtime tracking.

When Calendaria is installed and active, the tracker automatically creates calendar events for:

- Experience awards
- Training started
- Training completed

These entries are added directly to the active Calendaria calendar using the current in-world date.

Generated events include:
- Character name
- Training project name
- XP source
- XP cost
- Award details
- Storyteller attribution

The integration is fully automatic and requires no additional setup beyond enabling Calendaria.

If Calendaria is not installed or active, the module continues functioning normally without calendar features.

---

# 🗂️ Sorting Modes

Training entries can be sorted by:

- Created Date (incomplete first)
- Name (incomplete first)
- Created Date (all)
- Name (all)
- Source → Name → Date

---

# 💾 Import / Export

Training data can be exported and imported as JSON.

Exports include:
- XP pools
- Training entries
- Progress state
- Metadata

Imports automatically:
- Validate data structure
- Regenerate duplicate IDs where necessary

Useful for:
- Backup
- Campaign migration
- Character transfers
- Offline editing

---

# 🛠️ Installation

## Method 1 — Foundry Module Browser

Install using this manifest URL:

```text
https://raw.githubusercontent.com/Lazaric/exalted-training-tracker/main/module.json
```

---

## Method 2 — Manual Installation

1. Download the latest release ZIP
2. Extract to:

```text
FoundryVTT/Data/modules/exalted-training-tracker/
```

3. Enable the module in your world

---

# 📁 File Structure

```text
exalted-training-tracker/
│
├── module.json
├── README.md
│
├── scripts/
│   └── training-tab.js
│
├── styles/
│   └── training-tab.css
│
└── templates/
    ├── training-tab.hbs
    ├── training-edit-dialog.hbs
    └── bulk-edit.hbs
```

---

# 🧪 Compatibility

Tested with:

- Foundry VTT v13
- Exalted Third Edition system (AppV2)

Optional integrations:
- Calendaria

---

# 👑 Credits

## Author

**Lazaric**

Design, implementation, integration, and UI work.

---

## Development Assistance

This module was co-developed with assistance from ChatGPT for:
- Foundry integration guidance
- AppV2 compatibility
- UI architecture
- Debugging
- Workflow design

---

# 📜 License

MIT License

---

# 📣 Feedback & Issues

Bug reports, suggestions, and feature requests are welcome via the GitHub repository.