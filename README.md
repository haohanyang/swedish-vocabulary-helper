# Swedish Vocabulary Helper
A simple Google Apps Script by which you can easily look up and add Swedish words to your Google Sheets. 

![demo](/images/demo.gif)

## Install
### Algolia
Your need to register an account and create an application on [Algolia](https://www.algolia.com/), which provides a generous freemium. Then you need to create an [API key](https://dashboard.algolia.com/account/api-keys) for searching.

Run the script `download.py` which downloads raw `xml` file from [Folkets lexikon](https://folkets-lexikon.csc.kth.se/folkets/om.en.html) and converts it to a JSON file `dictionary.json`.

Create a new index `sv_en_v1` in your Algolia application and upload the generated JSON file.

After finishing the upload, in the index Configuration, add `word` and `inflections` to "Searchable attributes" and set "Index Languages" and "Query Languages" to Swedish.

### Google
You need to enable Google Apps Script API in the [settings](https://script.google.com/home/usersettings) and have a Google Cloud project.

Create a new Google spreadsheet and create a new associated Apps Script by clicking `"Extentions" -> "Apps Script"` on the menu bar.

On the Apps Script dashboard settings, in the section "Script Properties", enter attributes `ALGOLIA-API-KEY` and `ALGOLIA-APPLICATION-ID`.

![settings](/images/settings.jpg)

Update `.clasp.json` according to your Apps Script ID(in the settings page), Spreadsheet ID and GCP Project Id.

Run the command to install dependencies, log in with your Google account and push the local code to remote 
```
npm i
npm run login
npm run push
```

## Credits
* [Folkets lexikon](https://folkets-lexikon.csc.kth.se/folkets/om.html)
* [Algolia](algolia.com)
* [Google workspace](https://workspace.google.com/)