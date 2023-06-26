class SilentForgeFilePicker extends ForgeVTT_FilePicker {
    static async upload(source, target, file, options) {
        if (!ForgeVTT.usingTheForge && source !== "forgevtt") return SilentFilePicker.upload(source, target, file, options);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", `${target}/${file.name}`);

        const response = await ForgeAPI.call("assets/upload", formData);
        if (!response || response.error) {
        ui.notifications.error(response ? response.error : "An unknown error occured accessing The Forge API");
            return false;
        } else {
            return { path: response.url };
        }
    }
}

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
                let pageData = {
                    name: page.name,
                    type: page.type
                };

                if (page.type === "image") {
                    pageData.content = page.src;
                } else if (page.type === "text") {
                    pageData.content = page.text.content;
                }

                entryData.push(pageData);
            });
            data.push({
                name: entry.name,
                pages: entryData
            });
        }
        const json = JSON.stringify(data);
        const file = new File([json], `${subFolder.name}.json`, {type: "application/json"});
        SilentForgeFilePicker.upload("data", `active-time-lore`, file, {}).then((response) => { console.log(response); });
    }

    const json = JSON.stringify(index);
    const file = new File([json], "index.json", {type: "application/json"});
    SilentForgeFilePicker.upload("data", `active-time-lore`, file, {}).then((response) => { console.log(response); });
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