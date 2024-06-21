function myFunction() {
  var res = dataExtraction(1);
  var total = res["paging"]["total_pages"];

  Logger.log(total);

  liveUpdating(2);
}

function dataExtraction(page) {
  var response = UrlFetchApp.fetch(
    `https://gis-api.aiesec.org/v2/people?access_token=3f&page=` + page
  );
  var recievedDate = JSON.parse(response.getContentText());

  return recievedDate;
}

function liveUpdating(total) {
  var startDate = "1/02/2021";

  var sheetSignups =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LIVE");
  var page_number = 1;
  var allData = [];
  do {
    var data = dataExtraction(page_number);
    if (data.length != 0) {
      allData.push(data.data);
      page_number++;
    }
    //Logger.log(data.length)
  } while (page_number <= total);

  var newRows = [];
  for (let data of allData) {
    Logger.log(data.length);
    for (let i = 0; i < data.length; i++) {
      Logger.log(i);
      var duplicatedRowIndex = sheetSignups
        .createTextFinder(data[i].id)
        .matchEntireCell(true)
        .findAll()
        .map((x) => x.getRow());
      let duplicated = duplicatedRowIndex.length == 0 ? false : true;
      if (!duplicated) {
        var backgrounds = [];
        if (data[i].academic_experiences != null) {
          if (data[i].academic_experiences[0].backgrounds != null)
            for (k of data[i].academic_experiences[0].backgrounds) {
              backgrounds.push(k.name);
            }
        }
        newRows.push([
          data[i].created_at.substring(0, 10),
          data[i].id,
          data[i].first_name + " " + data[i].last_name,
          data[i].phone ? data[i].phone : "-",
          data[i].email ? data[i].email : "-",
          data[i].gender ? data[i].gender : "-",
          data[i].dob ? data[i].dob : "-",
          data[i].status ? data[i].status : "-",
          backgrounds.join(","),
          data[i].person_profile
            ? changeProductCode(data[i].person_profile.selected_programmes)
            : "-",
          data[i].home_lc.name,
          data[i].home_lc.country,
          data[i].lc_alignment ? data[i].lc_alignment.keywords : "-",
        ]);
      }
    }
  }
  if (newRows.length > 0) {
    sheetSignups
      .getRange(
        sheetSignups.getLastRow() + 1,
        1,
        newRows.length,
        newRows[0].length
      )
      .setValues(newRows);
  }
}
function changeProductCode(num) {
  var product = "";
  if (num == "7") product = "GV New";
  else if (num == "8") product = "GTa";
  else if (num == "9") product = "GTe";
  else if (num == "1") product = "GV Old";
  else if (num == "2") product = "GT";
  else if (num == "5") product = "GE";

  return product;
}
