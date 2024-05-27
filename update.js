"use strict";

const fs = require("fs");
const https = require("https");

const destination = `${__dirname}/icons`;
const availableFormats = ["128x128", "64x64", "32x32", "16x16"];
const availableNames = ["rank", "slug", "symbol"];



function main(){

  for (const availableName of availableNames) {
    for (const availableFormat of availableFormats) {
      run()
    }
  }

}



function run(){
  let CMCresult = "";
  let cryptocurrencyDownload = [];


  for (const availableName of availableNames) {
    for (const availableFormat of availableFormats) {
      let path = `${destination}/${availableFormat}/${availableName}/`
      if (!fs.existsSync(path)){
        fs.mkdirSync(path , { recursive: true });
      }
    }
  }

  https.get("https://s2.coinmarketcap.com/generated/search/quick_search.json", (response) => {
    response.on("data", (chunk) => {
      CMCresult += chunk;
    });
    response.on("end", () => {
      CMCresult = JSON.parse(CMCresult);
      for (let i = 0; i < CMCresult.length; i++) {
        for (const format of availableFormats) {
          cryptocurrencyDownload.push({
            url : `https://s2.coinmarketcap.com/static/img/coins/${format}/${CMCresult[i].id}.png`,
            format,
            path : `${destination}/${format}`,
            id : CMCresult[i].id,
            rank : i + 1
          });
        }

      }
      (async function loop() {
        console.log("Started saving icons...");
        for (let i = 0; i < cryptocurrencyDownload.length; i++) {
          await new Promise((resolve, reject) => {
            https.get(cryptocurrencyDownload[i].url, (response) => {
              if (response.statusCode !== 200) {
                let err = new Error(`The file ${CMCresult[i].slug}.png couldn\'t be retrieved :(`);
                err.status = response.statusCode;
                return reject(err);
              }
              let chunks = [];
              response.setEncoding("binary");
              response.on("data", (chunk) => {
                chunks += chunk;
              }).on("end", () => {
                let streams = [];

                for (const name of availableNames) {
                  let path = ""
                  if (name === "rank"){
                    path = `${cryptocurrencyDownload[i].path}/rank/${cryptocurrencyDownload[i].rank}.png`
                  }else{
                    path = `${cryptocurrencyDownload[i].path}/${name}/${CMCresult[i][name]}.png`
                  }

                  streams.push({
                    stream : fs.createWriteStream(path),
                    path
                  })
                }


                for (const streamsKey in streams) {
                  let stream = streams[streamsKey].stream
                  stream.write(chunks, "binary");
                  stream.on("finish", () => {
                    console.log(`Saved ${streams[streamsKey].path}`);
                    resolve();
                  });
                  response.pipe(stream);
                }


              });
            }).on("error", (err) => {
              console.log(`Oops, an error occurred: ${err.message}`);
              reject(err.message);
            });
          });
          if (i === cryptocurrencyDownload.length - 1) {
            console.log("Done!");
          }
        }
      })();
    });
  }).on("error", (err) => {
    console.log(`Oops, an error occurred: ${err.message}`);
  });
}


function save(res , ){

}

main();
