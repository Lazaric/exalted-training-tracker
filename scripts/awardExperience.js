const moduleId = "exalted-training-tracker";

function getPlayerCharacterActors() {
    const playerUsers = game.users.filter(user => !user.isGM && user.character);

    const actorMap = new Map();

    for (const user of playerUsers) {
        const actor = user.character;
        if (!actor) continue;
        if (actorMap.has(actor.id)) continue;

        actorMap.set(actor.id, actor);
    }

    return Array.from(actorMap.values())
        .sort((left, right) => left.name.localeCompare(right.name));
}

async function getActorTrainingData(actor) {
    const flags = await actor.getFlag(moduleId, "data");
    return {
        availableXP: {
            mandate: Number(flags?.availableXP?.mandate ?? 0),
            bonus: Number(flags?.availableXP?.bonus ?? 0),
        },
        items: Array.isArray(flags?.items) ? flags.items : [],
    };
}

async function setActorTrainingData(actor, flags) {
    await actor.setFlag(moduleId, "data", flags);
}

function buildRecipientRows(actors) {
    return actors.map(actor => `
    <label class="xpAwardRecipientRow">
      <input
        type="checkbox"
        name="recipient"
        value="${actor.id}"
        checked
      />
      <span>${foundry.utils.escapeHTML(actor.name)}</span>
    </label>
  `).join("");
}

function buildAwardDialogContent(actors) {
    return `
    <form class="xpAwardDialog">
      <div class="form-group">
        <label for="standardAward">Standard XP</label>
        <input id="standardAward" name="standardAward" type="number" min="0" step="1" value="0" />
      </div>

      <div class="form-group">
        <label for="exaltAward">Exalt XP</label>
        <input id="exaltAward" name="exaltAward" type="number" min="0" step="1" value="0" />
      </div>

      <div class="form-group">
        <label for="mandateAward">Mandate XP</label>
        <input id="mandateAward" name="mandateAward" type="number" min="0" step="1" value="0" />
      </div>

      <hr />

      <div class="form-group">
        <label>Recipients</label>
        <div class="xpAwardRecipientList">
          ${buildRecipientRows(actors)}
        </div>
      </div>
    </form>
  `;
}

function updateAwardSubmitState(html) {
    const standardAward = Number(html.find("[name='standardAward']").val() ?? 0);
    const exaltAward = Number(html.find("[name='exaltAward']").val() ?? 0);
    const mandateAward = Number(html.find("[name='mandateAward']").val() ?? 0);

    const checkedCount = html.find("[name='recipient']:checked").length;

    const hasAnyAward = standardAward > 0 || exaltAward > 0 || mandateAward > 0;
    const hasRecipients = checkedCount > 0;

    html.find("button[data-button='submit']").prop("disabled", !(hasAnyAward && hasRecipients));
}

async function awardExperienceToActors(actorIds, standardAward, exaltAward, mandateAward) {
    const awardedActors = [];

    for (const actorId of actorIds) {
        const actor = game.actors.get(actorId);
        if (!actor) continue;

        const updateData = {};

        if (standardAward > 0) {
            const currentStandard = Number(actor.system?.experience?.standard?.value ?? 0);
            updateData["system.experience.standard.value"] = currentStandard + standardAward;
        }

        if (exaltAward > 0) {
            const currentExalt = Number(actor.system?.experience?.exalt?.value ?? 0);
            updateData["system.experience.exalt.value"] = currentExalt + exaltAward;
        }

        if (Object.keys(updateData).length > 0) {
            await actor.update(updateData);
        }

        if (mandateAward > 0) {
            const flags = await getActorTrainingData(actor);
            const currentMandate = Number(flags.availableXP?.mandate ?? 0);

            flags.availableXP.mandate = currentMandate + mandateAward;
            await setActorTrainingData(actor, flags);
        }

        awardedActors.push(actor);
    }

    return awardedActors;
}

(() => {
    const moduleId = "exalted-training-tracker";

    async function openAwardExperienceDialog() {
        console.log(`${moduleId} | openAwardExperienceDialog called`);

        if (!game.user.isGM) {
            ui.notifications.warn("Only the Storyteller can award experience.");
            return;
        }

        new Dialog({
            title: "Award Experience",
            content: "<p>Dialog test reached successfully.</p>",
            buttons: {
                ok: {
                    label: "OK"
                }
            }
        }).render(true);
    }

    Hooks.once("ready", () => {
        console.log(`${moduleId} | ready hook fired`);

        const module = game.modules.get(moduleId);
        console.log(`${moduleId} | module from ready hook:`, module);

        if (!module) {
            console.error(`${moduleId} | module not found during ready hook`);
            return;
        }

        module.api ??= {};
        module.api.openAwardExperienceDialog = openAwardExperienceDialog;

        console.log(`${moduleId} | module.api assigned:`, module.api);
    });
})();