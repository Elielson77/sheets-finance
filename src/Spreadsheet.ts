import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const spreadsheetScope = ["https://www.googleapis.com/auth/spreadsheets"];
const spreadsheetId = process.env.SPREADSHEET_ID;
const accountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const accountAuth = new JWT({
  email: accountEmail,
  key: privateKey,
  scopes: spreadsheetScope,
});

if (!spreadsheetId) throw Error("A spreadsheet id must be informed");

const spreadsheet = new GoogleSpreadsheet(spreadsheetId, accountAuth);

const getSpreadSheet = async (): Promise<
  [GoogleSpreadsheet, null] | [null, Error]
> => {
  try {
    spreadsheet.resetLocalCache();
    await spreadsheet.loadInfo();

    return [spreadsheet as GoogleSpreadsheet, null];
  } catch {
    const error = new Error("Ocurred an error when get sheet information");
    return [null, error];
  }
};

export { getSpreadSheet };
