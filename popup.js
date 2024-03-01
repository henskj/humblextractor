let fileType = ".txt";

document.addEventListener('DOMContentLoaded', () => {
    //default filetype to .txt
    const defaultBtn = document.querySelector('.filetype-btn[data-filetype=".txt"]');
    if (defaultBtn) {
        defaultBtn.classList.add('selected');
    }
});

const filetypeButtons = document.querySelectorAll('.filetype-btn');

filetypeButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove the 'selected' class from all buttons to clear the previous selection
        filetypeButtons.forEach(btn => btn.classList.remove('selected'));

        // Add the 'selected' class to the clicked button to visually indicate it's selected
        this.classList.add('selected');

        // Update the chosen file type based on the button's data-filetype attribute
        fileType = this.getAttribute('data-filetype');

        console.log(`File type chosen: ${fileType}`); // For debugging
    });
});

document.getElementById('extractData').addEventListener('click', () => {
    console.log('Extract Data');
    browser.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
        const tabId = tabs[0].id;
        return browser.tabs.executeScript(tabId, {
            file: "humblextractor.js"
        }).then(() => tabId);
    })
    .then((tabId) => {
        browser.tabs.sendMessage(tabId, {action: "extract", fileType: fileType});
    })
    .catch(error => console.error(`Error in executing script or sending message: ${error}`));
});
    

document.getElementById('revealKeys').addEventListener('click', () => {
    console.log('Reveal Keys');
    // Placeholder for future "reveal keys" functionality
});