import {SilentForgeFilePicker} from "./lib/lib";

function refreshJournalFiles() {
    const rootFolder = game.folders.find(f => f.name === "Active Time Lore" && f.type === "JournalEntry");
    if (!rootFolder) {
        console.log("active-time-lore | No folder found! Please create a Journal Entry folder named 'Active Time Lore' and try again.");
        return;
    }

    const index = [];
    const subFolders = game.folders.filter(f => f.type === "JournalEntry" && f.ancestors.length > 0 && f.ancestors.find(ff => ff.id === rootFolder.id));
    for (let subFolder of subFolders) {
        index.push({
            name: subFolder.name,
            file: subFolder.name + ".json"
        });

        const entries = game.journal.filter(e => e.folder && e.folder.id === subFolder.id);
        const data = [];

        for (let entry of entries) {
            const entryData = [];
            entry.pages.forEach(page => {
                entryData.push(page.toJSON());
            });
            data.push({
                name: entry.name,
                pages: entryData
            });
        }
        const json = JSON.stringify(data);
        const file = new File([json], `${subFolder.name}.json`, {type: "application/json"});
        SilentForgeFilePicker.upload("data", `active-time-lore/${subFolder.name}.json`, file, {}).then((response) => { console.log(response); });
    }

    const json = JSON.stringify(index);
    const file = new File([json], "index.json", {type: "application/json"});
    SilentForgeFilePicker.upload("data", `active-time-lore/index.json`, file, {}).then((response) => { console.log(response); });
}

Hooks.once("init", function() {
    console.log("active-time-lore | Initializing active-time-lore");

    game.activeTimeLore = {
        refreshJournalFiles: refreshJournalFiles
    };
});

Hooks.once('ready', async function() {
    await FilePicker.createDirectory("data", "active-time-lore", {}).catch(() => {});

    refreshJournalFiles();
});