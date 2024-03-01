async function clickRevealKeys() {
  // Unused function for clicking to reveal all keys. Going to be very difficult to test, may implement one day.
  // Select all elements with the class 'key-redeemer'
  const keyRedeemers = document.querySelectorAll('.key-redeemer .js-keyfield.keyfield.enabled');

  for (let keyRedeemer of keyRedeemers) {
      // Find the specific child with the text 'Reveal your Steam key'
      const revealText = keyRedeemer.querySelector('.keyfield-value');
      if (revealText && revealText.textContent.trim() === "Reveal your Steam key") {
          revealText.click();
          // Wait a bit for the action to be processed, e.g., revealing the key, loading animations, etc.
          await new Promise(resolve => setTimeout(resolve, 500));
      }
  }
}

async function getInfo(action, fileType) {
  // Initially find the nextPageButton
  let firstPageButton = document.querySelector('.js-jump-to-page.jump-to-page[data-index="0"]');
  if (firstPageButton) {
    firstPageButton.click();
  }
  let nextPageButton = document.querySelector('.js-jump-to-page.jump-to-page i.hb.hb-chevron-right')?.parentNode;
  let allGamesAndKeys = [];
  let proceed = true;

  while (proceed) {
      // clickRevealKeys();
      if (!nextPageButton) {
        proceed = false;
      }
      let info = await extractGamesAndKeys(fileType); // Ensure this function returns the array of info
      allGamesAndKeys = allGamesAndKeys.concat(info); // Properly concatenate the arrays

      // Attempt to click and navigate to the next page, if there is one
      if (proceed) {
        nextPageButton.click();
      }
      console.log("Navigated to the next page.");

      // Wait for the page to load before continuing the loop
      await new Promise(resolve => setTimeout(resolve, 100)); // Adjust time as necessary

      // Re-evaluate the existence of the nextPageButton after navigation and timeout
      if (proceed) {
        nextPageButton = document.querySelector('.js-jump-to-page.jump-to-page i.hb.hb-chevron-right')?.parentNode;
      }
      /*
      Testing without this block, since it removes the last page.
      if (!nextPageButton) {
          console.log("No more pages to navigate.");
          break; // If no next button is found, exit the loop
      }
      */
  }
  console.log("Returned games and keys.");
  return allGamesAndKeys;
}


async function extractGamesAndKeys(fileType) {
  let gamesAndKeys = [];
  const rows = document.querySelectorAll('tbody tr'); // Adjust selector if needed
  console.log(rows);
  if (rows) {
    rows.forEach(row => {
        const gameName = row.querySelector('.game-name h4')?.title.trim();
        let key = row.querySelector('.js-redeemer-cell .keyfield-value')?.textContent.trim();
        
        if (!key || key === "Reveal your Steam key") {
            key = "UNCLAIMED";
        }

        if (gameName) { // Ensure there's a game name before adding
            if (fileType == ".txt") {
              gamesAndKeys.push(`${gameName} - ${key}`);
            } else if (fileType == ".csv") {
              gamesAndKeys.push(`"${gameName}",${key}`);
            } else {
              console.log("Unimplemented filetype.");
            }
        }
    })
  };

  return gamesAndKeys;
}

async function downloadGamesAndKeys(gamesAndKeys, fileType) {
  console.log("Log!");
  console.log(gamesAndKeys);
  if (fileType != ".txt" && fileType != ".csv") {
    console.log("Unimplemented filetype, exiting.");
    return;
  }
  let mimeType = "text/plain";
  if (fileType == ".csv") {
    mimeType = "text/csv"
  }
  let baseName = "games_and_keys";
  let fileName = baseName + fileType;
  const data = gamesAndKeys.join('\n');
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element and trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName; // The filename you want to save as
  document.body.appendChild(a); // Append to the document
  a.click(); // Trigger the download

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function processData(action, fileType) {
  console.log("Action and filetype in processData:");
  console.log(action);
  console.log(fileType);
  const info = await getInfo(action, fileType);
  const download = await downloadGamesAndKeys(info, fileType);
  console.log("Finished.");
}

// Start the process

let action = "extract";
let fileType = ".txt";
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received.")
  action = message.action;
  fileType = message.fileType;
  console.log(action);
  console.log(fileType);
  processData(action, fileType);
});