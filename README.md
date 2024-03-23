NotionProject
===============

This project use notion api, The purpose of this project is to read and modify properties of a Notion database.

Installing
----------

$ npm install

Usage
-----

`index.js` can be run from the command line on nodeJs.

`config.json` must require for excute script on project's root folder. Make your self.

```
//config.json
{
    "token": "YOUR_NOTION_TOKEN",
    "databaseId": "YOUR_NOTION_DATABASE_ID"
    "sequentialDate":
    {
        "columnName": "날짜",
        "year": 2024,
        "month": 3
    }
}
```
`sequentialDate` is a parameter used to sequentially change the date of the DB.

* `columnName` is the name of the date format column in DB.

* `year` is year you want to update.

* `month` is month you want to update.



run script:
```
$ node .\index.js
```

