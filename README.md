Lazaric's Exalted 3e Training & XP Tracker

A Foundry VTT module for the Exalted Third Edition system (AppV2)
This module adds a brand-new Training tab to all Exalted 3e character sheets.
It provides an elegant interface for tracking experience points, training projects, time spent, and advancement costs—without modifying any core system files.
Designed for long-term campaigns where XP spending and training time matter.

ChatGPT Pro was used for source reference and assistance (and writing this Readme!)

✨ Features
🟡 New Training Tab on the Character Sheet

Automatically injected into the existing sheet tabs using Foundry’s AppV2 rendering pipeline.

🎓 Training Project Tracking
Create, edit, and delete training items
Track total days required and days completed
Increment training time by +1 / +7 / +28 days
Mark items as completed
Automatic chat notifications for all updates

📊 XP Pool Management
Displays and allows editing of all XP pools:
Standard XP
Exalt XP
Mandate XP (custom)
Bonus Points (custom)

Includes real-time calculation of:
Spent
Available
Total

🗂️ Smart Sorting Modes
Cycle through several ways to organise your training projects:
Created Date (incomplete first)
Name (incomplete first)
Created Date (all)
Name (all)
Source → Name → Date

📅 Calendar Integration
Uses Simple Calendar (if installed) to stamp new training entries with an in-world date.
If SC is not installed or active, falls back to the real-world system date.

💾 Import / Export
Easily back up or migrate training data:
Exports a JSON file containing XP pools and all training items
Imports the same format, with validation and automatic ID regeneration

📐 Non-Destructive Design
This module does not modify original system files.
It injects its tab and UI at runtime, making it resilient to most Exalted 3e system updates.
