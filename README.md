# 📘 **Exalted 3e – Training & XP Tracker**

## *A Foundry VTT module for the Exalted Third Edition system (AppV2)*

This module adds a brand-new **Training** tab to all Exalted 3e character sheets.  
It provides an elegant interface for tracking experience points, training projects, time spent, and advancement costs—without modifying any core system files.

Designed for long-term campaigns where XP spending and training time matter.

---

## ✨ **Features**

### 🟡 **New Training Tab on the Character Sheet**
Automatically injected into the existing sheet tabs using Foundry’s AppV2 rendering pipeline.

### 🎓 **Training Project Tracking**
- Create, edit, and delete training items  
- Track *total days required* and *days completed*  
- Increment training time by **+1 / +7 / +28** days  
- Mark items as completed  
- Automatic chat notifications for all updates

### 📊 **XP Pool Management**
Displays and allows editing of all XP pools:
- Standard XP  
- Exalt XP  
- Mandate XP *(custom)*  
- Bonus Points *(custom)*  

Includes real-time calculation of:
- **Spent**
- **Available**
- **Total**

### 🗂️ **Smart Sorting Modes**
Cycle through several ways to organise your training projects:
- Created Date (incomplete first)
- Name (incomplete first)
- Created Date (all)
- Name (all)
- Source → Name → Date

### 📅 **Calendar Integration**
Uses **Simple Calendar** (if installed) to stamp new training entries with an in-world date.

If SC is not installed or active, falls back to the real-world system date.

### 💾 **Import / Export**
Easily back up or migrate training data:
- Exports a JSON file containing XP pools and all training items  
- Imports the same format, with validation and automatic ID regeneration  

### 📐 **Non-Destructive Design**
This module does **not** modify original system files.  
It injects its tab and UI at runtime, making it resilient to most Exalted 3e system updates.

---

## 🛠️ **Installation**

### **Method 1: Foundry VTT Module Manager**
Use the “Install Module” button and paste this Manifest URL:

```
https://raw.githubusercontent.com/Lazaric/exalted-training-tracker/main/module.json
```

### **Method 2: Manual Installation**
1. Download the latest `.zip` release  
2. Extract into:  
   ```
   FoundryVTT/Data/modules/exalted-training-tracker/
   ```
3. Enable the module in your world

---

## 📁 **File Structure**

```
exalted-training-tracker/
│
├── module.json
├── README.md
│
├── scripts/
│   └── training-tab.js
│
└── styles/
    └── training-tab.css
```

Templates are loaded from:

```
modules/exalted-training-tracker/templates/
```

---

## 🧪 **Compatibility**

- **Foundry VTT v13**  
- **Exalted Third Edition (AppV2)**  
- Optional integration with:
  - **Simple Calendar**
  - **Seasons & Stars** (planned)

---

## 👑 **Credits**

### **Author**
**Lazaric**  
Creator, designer, and implementer of the Exalted Training Tracker.

### **Development Assistance**
This module was co-developed with the assistance of **ChatGPT**,  
providing architectural guidance, integration debugging, and code generation support throughout the build.

---

## 📜 **License**

MIT License (or another license of your choosing—just say so and this file can be updated)

---

## 📣 **Feedback & Issues**

If you run into any problems, feel free to submit an issue or request a feature on the GitHub repository.
