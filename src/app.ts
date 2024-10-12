const searchIndex = "sv_en_v1"

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("Folkets lexikon")
        .addItem("Search selected", "searchSelected")
        .addItem("Add AppSheet id", "addAppSheetId")
        .addToUi();
}

function searchSelected() {
    const searchText = SpreadsheetApp.getCurrentCell().getRichTextValue().getText().trim();
    if (searchText) {
        try {
            const searchResults = searchWordsByKeyword(searchText);
            showSearchResults(searchText, searchResults);
        } catch (error) {
            showAlert(error.message)
        }
    } else {
        showAlert("Search keyword can not be empty")
    }
}

function addAppSheetId() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] && !data[i][5]) {
            sheet.getRange("F" + (i + 1)).setValue(Date.now())
        }
    }
}

function showSearchResults(keyword: string, results: object[]) {
    // Show search bar
    const html = HtmlService.createTemplateFromFile("search_results");
    // Add search result to HTML
    html.keyword = keyword
    html.searchResults = results.map(result => mapQueryResult(result));

    SpreadsheetApp.getUi()
        .showSidebar(html.evaluate().setTitle("Search results"));
}

function getCredentials_(): string[] {
    const algolia_app_id = PropertiesService.getScriptProperties().getProperty("ALGOLIA-APPLICATION-ID")
    const algolia_api_key = PropertiesService.getScriptProperties().getProperty("ALGOLIA-API-KEY")

    if (!(algolia_api_key && algolia_api_key)) {
        throw new Error("ALGOLIA-APPLICATION-ID or ALGOLIA-API-KEY not set")
    }
    return [algolia_app_id, algolia_api_key]
}


function searchWordsByKeyword(keyword: string): object[] {
    const [algolia_app_id, algolia_api_key] = getCredentials_()

    const url = `https://${algolia_app_id}-dsn.algolia.net/1/indexes/${searchIndex}?query=` + encodeURIComponent(keyword);
    const response = UrlFetchApp.fetch(url,
        {
            "muteHttpExceptions": true,
            "headers": {
                "X-Algolia-Application-Id": algolia_app_id,
                "X-Algolia-API-Key": algolia_api_key
            }
        });

    if (response.getResponseCode() == 200) {
        let data = JSON.parse(response.getContentText());
        return data["hits"];
    } else {
        Logger.log("Failed to search: " + response.getContentText());
        throw new Error(`Failed to search keyword \"${keyword}\"`)
    }
}

function getWordById(id: string) {
    const [algolia_app_id, algolia_api_key] = getCredentials_()
    const url = `https://${algolia_app_id}-dsn.algolia.net/1/indexes/${searchIndex}/${id}`
    const response = UrlFetchApp.fetch(url,
        {
            "muteHttpExceptions": true,
            "headers": {
                "X-Algolia-Application-Id": algolia_app_id,
                "X-Algolia-API-Key": algolia_api_key
            }
        });

    if (response.getResponseCode() == 200) {
        const data = mapQueryResult(JSON.parse(response.getContentText()))
        return data
    } else {
        throw new Error(`Failed to get word ${id}: ${response.getContentText()}`)
    }

}

function addWordById(id: string) {
    const data = getWordById(id)
    const entry = [data["word"], data["class"], data["inflections"], data["translations"], data["examples"]]
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = SpreadsheetApp.getCurrentCell().getRow()
    sheet.getRange(row, 1, 1, entry.length).setValues([entry])
}

function mapQueryResult(result: object): object {
    let word_class = result["class"]

    switch (word_class) {
        case "nn":
            word_class = "substantiv";
            break;
        case "jj":
            word_class = "adjektiv";
            break;
        case "vb":
            word_class = "verb";
            break;
        case "ab":
            word_class = "adverb"
            break;
        case "pp":
            word_class = "preposition"
            break;
        case "kn":
            word_class = "konjunktion"
            break;
        case "in":
            word_class = "interjektion"
            break;
        case "pn":
            word_class = "pronomen"
            break;
        case "prefix":
            word_class = "prefix"
            break;
        case "abbrev":
            word_class = "förkortning";
            break;
        default:
            word_class = "övrigt"
    }
    return {
        id: result["objectID"],
        word: result["word"],
        class: word_class,
        translations: (result["translations"] || []).join(", "),
        inflections: (result["inflections"] || []).join(", "),
        examples: (result["examples"] || []).join(", ")
    }
}

function showAlert(message: any) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(message);
}