import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: "TEAMID.org.cpsglobal.quranforall", 
            paths: [ "/*", "/commentary/*" ]
          }
        ]
      }
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
