// TRAINING TRACKER
Hooks.once("init", () => {

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "modules/exalted-training-tracker/styles/training-tab.css";
  document.head.appendChild(link);

  // Reset confirmation setting every time sheet is opened
  console.log("Rerender reset of confirmation");
  app._trainingHideConfirmActions = false;

  // --- DATE FORMAT HELPER ---
  Handlebars.registerHelper("formatDate", function(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // fallback: show raw

    // Format: yyyy-MM-dd HH:mm
    const pad = (n) => (n < 10 ? "0" + n : n);

    const yyyy = date.getFullYear();
    const MM   = pad(date.getMonth() + 1);
    const dd   = pad(date.getDate());
    const HH   = pad(date.getHours());
    const mm   = pad(date.getMinutes());

    return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
  });
});

const TRAINING_SORT_MODES = [
  "created-status",
  "name-status",
  "created-all",
  "name-all",
  "source-name-date",
];

/* ATTACH EVENT BUTTON CLICK FUNCTIONS
 * Helper: Activate listeners inside the Training tab
 * ------------------------------------------------------------- */
function activateTrainingListeners(app, html, actor) {
  /* STANDARD + EXALT XP INPUTS
   * -------------------------------------------------------- */
  html.find(".core-xp-input").off("change.training");
  html.find(".core-xp-input").on("change.training", async (evt) => {
    const type = evt.currentTarget.dataset.xpType; // "standard" or "exalt"
    const value = Number(evt.currentTarget.value);

    const current = actor.system.experience[type];

    // The Exalted system requires ALL fields in the XP object to remain valid
    const updateData = {
      [`system.experience.${type}.value`]: value,
      [`system.experience.${type}.total`]: current.total ?? 0,
      [`system.experience.${type}.remaining`]: current.remaining ?? 0,
    };

    await actor.update(updateData);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `💡 <b>${actor.name}</b> updated <b>${type} XP</b> to <b>${value}</b>.`,
    });
  }); // end core-xp-input

  /* MANDATE + BONUS XP INPUTS (FLAG STORAGE)
   * -------------------------------------------------------- */
  html.find(".custom-xp-input").off("change.training");
  html.find(".custom-xp-input").on("change.training", async (evt) => {
    const key = evt.currentTarget.dataset.custom; // "mandate" or "bonus"
    const value = Number(evt.currentTarget.value);

    const flags = await getActorTrainingData(actor);
    flags.availableXP[key] = value;

    await setActorTrainingData(actor, flags);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `📘 <b>${actor.name}</b> updated <b>${key} XP</b> to <b>${value}</b>.`,
    });

    app.render(false); // re-render tab only
  }); // end custom-xp-input

  /* ADD TRAINING
   * -------------------------------------------------------- */
  html.find(".event_trainingAdd").off("click.training");
  html.find(".event_trainingAdd").on("click.training", async () => {
    const newItem = await openEditTrainingDialog(actor);
    if (!newItem) return;

    const flags = await getActorTrainingData(actor);
    flags.items.push(newItem);

    await setActorTrainingData(actor, flags);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `✏️ <b>${actor.name}</b> added training: <b>${newItem.name}</b>.`,
    });

    await refreshTrainingTab(app, html, actor);
  }); //end event_trainingAdd

  /* EDIT TRAINING
   * -------------------------------------------------------- */
  html.find(".event_TrainingEdit").off("click.training");
  html.find(".event_TrainingEdit").on("click.training", async (evt) => {
    const card = evt.currentTarget.closest(".training-card");
    const id = card.dataset.trainingId;

    const flags = await getActorTrainingData(actor);
    const item = flags.items.find((i) => i.id === id);

    if (!item) return;

    const updated = await openEditTrainingDialog(actor, item);
    if (!updated) return;

    const index = flags.items.findIndex((i) => i.id === id);
    flags.items[index] = updated;

    await setActorTrainingData(actor, flags);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `✏️ <b>${actor.name}</b> updated training: <b>${updated.name}</b>.`,
    });

    await refreshTrainingTab(app, html, actor);
  }); //end event_TrainingEdit

  /* INCREMENT DAYS
   * -------------------------------------------------------- */
  html.find(".event_IncTraining").off("click.training");
  html.find(".event_IncTraining").on("click.training", async (evt) => {
    const inc = Number(evt.currentTarget.dataset.inc);

    const card = evt.currentTarget.closest(".training-card");
    const id = card.dataset.trainingId;

    const flags = await getActorTrainingData(actor);
    const item = flags.items.find((i) => i.id === id);

    item.daysCompleted = (item.daysCompleted || 0) + inc;

    await setActorTrainingData(actor, flags);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `⏱️ <b>${actor.name}</b> trained <b>${inc} day(s)</b> on <b>${item.name}</b>.`,
    });

    await refreshTrainingTab(app, html, actor);
  }); //end event_IncTraining

  /* MARK COMPLETE
   * -------------------------------------------------------- */
  html.find(".event_TrainingComplete").off("click.training");
  html.find(".event_TrainingComplete").on("click.training", async (evt) => {
    if (!await confirmIfEnabled(app, actor,"Are you sure you want to mark this training as completed? This action cannot be undone."))
      return;

    const card = evt.currentTarget.closest(".training-card");
    const id = card.dataset.trainingId;

    const flags = await getActorTrainingData(actor);
    const item = flags.items.find((i) => i.id === id);

    item.completed = true;

    await setActorTrainingData(actor, flags);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `🎉 <b>${actor.name}</b> completed training: <b>${item.name}</b>.`,
    });

    await refreshTrainingTab(app, html, actor);
  }); // end event_TrainingComplete
  /* DELETE TRAINING ENTRY
   * -------------------------------------------------------- */
  html.find(".event_TrainingDelete").off("click.training");
  html.find(".event_TrainingDelete").on("click.training", async (evt) => {
    if (!await confirmIfEnabled(app, actor,"Are you sure you want to delete this training project? This action cannot be undone."))
      return;

    const card = evt.currentTarget.closest(".training-card");
    const id = card.dataset.trainingId;

    const flags = await getActorTrainingData(actor);

    const item = flags.items.find((i) => i.id === id);

    // Remove entry
    flags.items = flags.items.filter((i) => i.id !== id);

    await setActorTrainingData(actor, flags);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `🗑️ <b>${actor.name}</b> deleted training project: <b>${item.name}</b>.`,
    });

    await refreshTrainingTab(app, html, actor);
  }); // end event_TrainingDelete

  /* SORT MODE CYCLE
   * -------------------------------------------------------- */
  html.find(".event_SortCycle").off("click.training");
  html.find(".event_SortCycle").on("click.training", async () => {
    const newMode = await cycleSortMode(actor);
    console.log("New sort mode:", newMode);

    await refreshTrainingTab(app, html, actor);
  }); // end event_SortCycle

  /* EXPORT TRAINING DATA
   * -------------------------------------------------------- */
  html.find(".event_TrainingExport").off("click.training");
  html.find(".event_TrainingExport").on("click.training", async (evt) => {
    const flags = await getActorTrainingData(actor);

    const data = {
      actorName: actor.name,
      timestamp: new Date().toISOString(),

      systemXP: {
        standard: {
          value: actor.system.experience?.standard?.value ?? 0,
          total: actor.system.experience?.standard?.total ?? 0,
          remaining: actor.system.experience?.standard?.remaining ?? 0,
        },
        exalt: {
          value: actor.system.experience?.exalt?.value ?? 0,
          total: actor.system.experience?.exalt?.total ?? 0,
          remaining: actor.system.experience?.exalt?.remaining ?? 0,
        },
      },

      customXP: {
        mandate: flags.availableXP?.mandate ?? 0,
        bonus: flags.availableXP?.bonus ?? 0,
      },

      trainingItems: flags.items || [],
    };

    console.log("Exporting training data:", data);

    // Serialize
    const json = JSON.stringify(data, null, 2);

    // Generate a filename
    const safeName = actor.name.replace(/[^a-z0-9-_]/gi, "_");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `TrainingData_${safeName}_${ts}.json`;

    // Trigger browser download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `📤 <b>${actor.name}</b> exported training data.`,
    });
  }); //end event_TrainingExport

  /* IMPORT TRAINING DATA
   * -------------------------------------------------------- */
  html.find(".event_TrainingImport").off("click.training");
  html.find(".event_TrainingImport").on("click.training", async (evt) => {
    // Open native file picker
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);

        // Validate structure
        const validated = validateImportedTrainingData(json);

        if (!validated.success) {
          ui.notifications.error(`Import failed: ${validated.error}`);
          console.error("Training Import Error:", validated.error);
          return;
        }

        // Apply result to actor
        await applyImportedTrainingData(actor, validated.data);

        ChatMessage.create({
          speaker: { actor: actor.id, alias: actor.name },
          content: `📥 <b>${actor.name}</b> imported training data from <b>${file.name}</b>.`,
        });

        await refreshTrainingTab(app, html, actor);
      } catch (err) {
        ui.notifications.error(`Training data import failed.`);
        console.error("Training Import Exception:", err);
      }
    };

    input.click();
  }); //end event_TrainingImport

  /* SORT ASC/DESC TOGGLE
 * -------------------------------------------------------- */
  html.find(".event_SortAscDesc").off("click.training");
  html.find(".event_SortAscDesc").on("click.training", async () => {
    const newDir = await toggleSortDescending(actor);
    console.log("Sort direction now:", newDir ? "descending" : "ascending");
    await refreshTrainingTab(app, html, actor);
  });
  /* CONFIRMATIONS TOGGLE
 * -------------------------------------------------------- */
  html.find(".event_ConfirmToggle").off("click.training");
  html.find(".event_ConfirmToggle").on("click.training", async () => {
    app._trainingHideConfirmActions = !app._trainingHideConfirmActions;

    ChatMessage.create({
      speaker: { actor: actor.id, alias: actor.name },
      content: `🔧 <b>${actor.name}</b> turned confirmations <b>${app._trainingHideConfirmActions ? "ON" : "OFF"}</b>.`
    });

    await refreshTrainingTab(app, html, actor);
  });


  /* 3-dots dropdown menu toggle
 * ---------------------------------------------- */
  html.find(".training-menu-button").off("click.menu");
  html.find(".training-menu-button").on("click.menu", evt => {
    const container = evt.currentTarget.closest(".training-menu-container");
    container.classList.toggle("open");
  });

// Close dropdown if you click anywhere else
  $(document).on("click.trainingMenu", evt => {
    if (!evt.target.closest(".training-menu-container")) {
      html.find(".training-menu-container").removeClass("open");
    }
  });

} // end activateTrainingListeners

/* -------------------------------------------------------------
 * Helper: Load saved training data from flags
 * ------------------------------------------------------------- */
async function getActorTrainingData(actor) {
  return (
    actor.getFlag("exalted-training-tracker", "data") || {
      availableXP: { mandate: 0, bonus: 0 },
      items: [],
    }
  );
}

/* Helper: Save training data to flags
 * ------------------------------------------------------------- */
async function setActorTrainingData(actor, data) {
  return actor.setFlag("exalted-training-tracker", "data", data);
}

/* -------------------------------------------------------------
 * Helper: Build template rendering context
 * ------------------------------------------------------------- */
async function buildTrainingContextAsync(actor, app) {
  const flags = await getActorTrainingData(actor);

  const sortMode = await getSortMode(actor);
  const sorted = await sortTrainingItemsAsync(flags.items || [], sortMode, actor);

  const xpTotals = calculateXPTotals(actor, sorted, flags.availableXP);

  const ctx = {
    system: actor.system,
    settings: actor.system.settings, // <-- FIX
    items: sorted,
    customXP: flags.availableXP || {},
    xpTotals,
    sortMode,
    sortDescending: await getSortDescending(actor),
    hideConfirmActions: app._trainingHideConfirmActions
  };

  for (const item of flags.items) {
    if (!item.createdDate) item.createdDate = new Date().toISOString();
  }

  return ctx;
}

async function sortTrainingItemsAsync(items, mode, actor) {

  console.log("sortTrainingItemsAsync pre sort", items);
  const byCreated = (a, b) => normalizeDate(a.createdDate).localeCompare(normalizeDate(b.createdDate));

  const byName = (a, b) => (a.name || "").localeCompare(b.name || "");
  const bySource = (a, b) => a.xpSource.localeCompare(b.xpSource);

  // Incomplete first, then complete
  const byStatus = (a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  };

  let sorted;

  switch (mode) {
    case "created-status":
      sorted = [...items].sort((a, b) => byStatus(a, b) || byCreated(a, b));
      break;

    case "name-status":
      sorted = [...items].sort((a, b) => byStatus(a, b) || byName(a, b));
      break;

    case "created-all":
      sorted = [...items].sort(byCreated);
      break;

    case "name-all":
      sorted = [...items].sort(byName);
      break;

    case "source-name-date":
      sorted = [...items].sort((a, b) =>
          bySource(a, b) || byName(a, b) || byCreated(a, b)
      );
      break;

    default:
      sorted = [...items];
  }

  // Apply ASC/DESC
  const descending = await getSortDescending(actor);
  if (descending) sorted.reverse();

  console.log("sortTrainingItemsAsync post sort", sorted);

  return sorted;
}

async function getSortMode(actor) {
  return (
    actor.getFlag("exalted-training-tracker", "sortMode") || "created-status"
  );
}

async function cycleSortMode(actor) {
  const current = await getSortMode(actor);
  const index = TRAINING_SORT_MODES.indexOf(current);
  const next = TRAINING_SORT_MODES[(index + 1) % TRAINING_SORT_MODES.length];
  await actor.setFlag("exalted-training-tracker", "sortMode", next);
  return next;
}

/* XP TOTALS
 *
 * standard = actor.system.experience.standard
 * exalt    = actor.system.experience.exalt
 * mandate  = flags.availableXP.mandate
 * bonus    = flags.availableXP.bonus
 *
 * We calculate SPENT by summing xpCost on training items.
 * ------------------------------------------------------------- */
function calculateXPTotals(actor, items, customXP) {
  const totals = {
    standard: {
      spent: 0,
      available: 0,
      total: actor.system.experience.standard.total ?? 0,
    },
    exalt: {
      spent: 0,
      available: 0,
      total: actor.system.experience.exalt.total ?? 0,
    },
    mandate: { spent: 0, available: 0, total: customXP.mandate ?? 0 },
    bonus: { spent: 0, available: 0, total: customXP.bonus ?? 0 },
  };

  for (const t of items) {
    if (!t.completed && t.xpCost) {
      if (t.xpSource === "standard") totals.standard.spent += Number(t.xpCost);
      if (t.xpSource === "exalt") totals.exalt.spent += Number(t.xpCost);
      if (t.xpSource === "mandate") totals.mandate.spent += Number(t.xpCost);
      if (t.xpSource === "bonus") totals.bonus.spent += Number(t.xpCost);
    }
  }

  // compute available = total - spent
  totals.standard.available = totals.standard.total - totals.standard.spent;
  totals.exalt.available = totals.exalt.total - totals.exalt.spent;
  totals.mandate.available = totals.mandate.total - totals.mandate.spent;
  totals.bonus.available = totals.bonus.total - totals.bonus.spent;

  return totals;
}



/* -------------------------------------------------------------
 * Helper: Refresh only the Training tab contents in-place
 * ------------------------------------------------------------- */
async function refreshTrainingTab(app, html, actor) {
  const $html = html instanceof jQuery ? html : $(html);

  const windowContent = $html.closest("section.window-content").length
    ? $html.closest("section.window-content")
    : $html.find("section.window-content");

  if (!windowContent.length) {
    console.error(
      "Training Tracker | Could not find window-content for refresh."
    );
    return;
  }

  const trainingTab = windowContent.find("div.tab[data-tab='training']");
  const context = await buildTrainingContextAsync(actor, app);
  const content = await foundry.applications.handlebars.renderTemplate(
    "modules/exalted-training-tracker/templates/training-tab.hbs",
    context
  );

  if (trainingTab.length) {
    // Replace existing inner HTML
    trainingTab.html(content);
  } else {
    // First-time creation
    windowContent.append(`
      <div class="tab flex-center" data-group="primary" data-tab="training" data-application-part="training">
        ${content}
      </div>
    `);
  }

  // Re-bind listeners to the new DOM
  activateTrainingListeners(app, $html, actor);
}

/* -------------------------------------------------------------
 * MAIN HOOK — Inject Tab + Tab Contents
 * ------------------------------------------------------------- */
Hooks.on("renderExaltedThirdActorSheet", async (app, html, data) => {
  const actor = app.actor;
  const $html = $(html);



  /* ---------------------------
   * 1) Inject tab button
   * --------------------------- */
  const tabsNav = $html.find("nav.sheet-tabs[data-group='primary']");
  if (tabsNav.find("[data-tab='training']").length === 0) {
    tabsNav.append(`
            <a class="item" data-action="tab" data-group="primary" data-tab="training">
                Training
            </a>
        `);
  }

  /* ---------------------------
   * 2) Inject tab body
   * --------------------------- */

  // Find the main container where all tabs live
  const windowContent = $html.closest("section.window-content").length
    ? $html.closest("section.window-content")
    : $html.find("section.window-content");

  if (!windowContent || windowContent.length === 0) {
    console.error(
      "Training Tracker | Could not find window-content container."
    );
    return;
  }

  // Only create the tab body if it does not already exist
  if (windowContent.find("div.tab[data-tab='training']").length === 0) {
    const context = await buildTrainingContextAsync(actor, app);
    const content = await foundry.applications.handlebars.renderTemplate(
      "modules/exalted-training-tracker/templates/training-tab.hbs",
      context
    );

    windowContent.append(`
            <div class="tab flex-center" data-group="primary" data-tab="training" data-application-part="training">
                ${content}
            </div>
        `);
  }

  /* ---------------------------
   * 3) Activate listeners for this tab
   * --------------------------- */
  activateTrainingListeners(app, $html, actor);
});

async function openEditTrainingDialog(actor, itemData = null) {
  const startDate = getCurrentTrainingDate();

  const newItem = itemData || {
    id: foundry.utils.randomID(),
    name: "",
    xpCost: 0,
    xpSource: "standard",
    totalDays: 0,
    daysCompleted: 0,
    startDate: startDate,
    notes: "",
    completed: false,
    createdDate: new Date().toISOString(),
  };

  const html = await foundry.applications.handlebars.renderTemplate(
    "modules/exalted-training-tracker/templates/training-edit-dialog.hbs",
    { item: newItem }
  );

  const result = await foundry.applications.api.DialogV2.prompt({
    window: {
      title: itemData ? "Edit Training" : "Add Training",
    },
    content: html,
    buttons: [
      {
        label: "Cancel",
        action: "cancel",
        default: false,
      },
    ],
  });

  console.log("Dialog result:", result);

  if (result !== "ok") return null;

  const form = document.querySelector(".training-edit-dialog");

  return {
    id: newItem.id,
    name: form.querySelector("[name='name']").value,
    xpCost: Number(form.querySelector("[name='xpCost']").value),
    xpSource: form.querySelector("[name='xpSource']").value,
    totalDays: Number(form.querySelector("[name='totalDays']").value),
    startDate: form.querySelector("[name='startDate']").value,
    notes: form.querySelector("[name='notes']").value,
    daysCompleted: newItem.daysCompleted,
    completed: newItem.completed,
    createdDate: newItem.createdDate,
  };
}

function getCurrentTrainingDate() {
  const sc = game.modules.get("foundryvtt-simple-calendar");

  if (sc?.active && SimpleCalendar?.api?.currentDateTimeDisplay) {
    const result = SimpleCalendar.api.currentDateTimeDisplay();

    const day = result.day;
    const month = result.monthName;
    const yearPrefix = result.yearPrefix ?? "";
    const year = result.year;

    // Final format: "21 Descending Air RY768"
    return `${day} ${month}, ${yearPrefix}${year}`;
  }

  // Fallback (real world)
  const now = new Date();
  return now.toLocaleDateString();
}

function validateImportedTrainingData(json) {
  // Basic shape check
  if (typeof json !== "object") {
    return { success: false, error: "Root JSON structure invalid." };
  }

  // -------------------------
  // Validate system XP pools
  // -------------------------
  const sys = json.systemXP;
  if (!sys || !sys.standard || !sys.exalt) {
    return { success: false, error: "Missing systemXP section." };
  }

  const pools = ["standard", "exalt"];

  for (const p of pools) {
    const v = Number(sys[p].value);
    if (isNaN(v) || v <= 0) {
      return {
        success: false,
        error: `${p} XP 'value' must be > 0`,
      };
    }
  }

  // -------------------------
  // Validate custom XP
  // -------------------------
  const custom = json.customXP || {};
  const mandate = Number(custom.mandate ?? 0);
  const bonus = Number(custom.bonus ?? 0);

  // -------------------------
  // Validate training items
  // -------------------------
  const items = Array.isArray(json.trainingItems) ? json.trainingItems : [];

  const required = [
    "name",
    "completed",
    "xpCost",
    "xpSource",
    "totalDays",
    "daysCompleted",
  ];

  const cleaned = [];

  for (const item of items) {
    // Check required fields exist
    for (const field of required) {
      if (
        item[field] === undefined ||
        item[field] === null ||
        item[field] === ""
      ) {
        return {
          success: false,
          error: `Training entry missing required field: ${field}`,
        };
      }
    }

    // Fill missing ID
    const id = item.id || foundry.utils.randomID();

    cleaned.push({
      id,
      name: item.name,
      xpCost: Number(item.xpCost),
      xpSource: item.xpSource,
      totalDays: Number(item.totalDays),
      daysCompleted: Number(item.daysCompleted),
      startDate: item.startDate || "Unknown",
      notes: item.notes || "",
      createdDate: item.createdDate || Date.now().toISOString(),
      completed: Boolean(item.completed),
    });
  }

  return {
    success: true,
    data: {
      systemXP: sys,
      customXP: { mandate, bonus },
      items: cleaned,
    },
  };
}

async function applyImportedTrainingData(actor, data) {
  // --------------------------
  // Overwrite system XP
  // --------------------------
  const updateData = {
    "system.experience.standard.value": data.systemXP.standard.value,
    "system.experience.standard.total": data.systemXP.standard.total,
    "system.experience.standard.remaining": data.systemXP.standard.remaining,

    "system.experience.exalt.value": data.systemXP.exalt.value,
    "system.experience.exalt.total": data.systemXP.exalt.total,
    "system.experience.exalt.remaining": data.systemXP.exalt.remaining,
  };

  await actor.update(updateData);

  // --------------------------
  // Overwrite module-stored XP
  // --------------------------
  const flags = await getActorTrainingData(actor);
  flags.availableXP = {
    mandate: data.customXP.mandate,
    bonus: data.customXP.bonus,
  };

  // --------------------------
  // Replace training items
  // --------------------------
  flags.items = data.items;

  await setActorTrainingData(actor, flags);
}

async function getSortDescending(actor) {
  return actor.getFlag("exalted-training-tracker", "sortDescending") ?? false;
}

async function toggleSortDescending(actor) {
  const current = await getSortDescending(actor);
  await actor.setFlag("exalted-training-tracker", "sortDescending", !current);
  return !current;
}
function normalizeDate(value) {
  if (!value) return "";

  // If it's already a sortable ISO-ish string, return it directly
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  }

  // If numeric (timestamp), date object, etc.
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}


async function confirmIfEnabled(app, actor, message) {
  if (app._trainingHideConfirmActions) return true;
  return window.confirm(message);
}
