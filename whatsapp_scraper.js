const puppeteer = require('puppeteer');

async function readWhatsAppMessages() {
    console.log("Launching Puppeteer...");

    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome Dev\.app/Contents/MacOS/Google Chrome',
        headless: false
    });
    const page = await browser.newPage();

    console.log("Opening WhatsApp Web...");
    await page.goto('https://web.whatsapp.com');

    console.log("Please scan the QR code in your WhatsApp Web.");
    await page.waitForTimeout(10000); // Wait for manual login

    console.log("Checking if chat list is loaded...");
    try {
        await page.waitForSelector("._2_1wd", { timeout: 20000 });
    } catch (error) {
        console.log("Chat list not found. Exiting...");
        await browser.close();
        return;
    }

    // Change this to your WhatsApp chat name
    const chatName = "Job Applications"; 

    console.log(`Looking for chat: ${chatName}`);
    const chatExists = await page.evaluate((chatName) => {
        let chat = document.querySelector(`span[title='${chatName}']`);
        if (chat) {
            chat.click();
            return true;
        }
        return false;
    }, chatName);

    if (!chatExists) {
        console.log(`Chat '${chatName}' not found! Exiting...`);
        await browser.close();
        return;
    }

    console.log("Chat found. Waiting for messages to load...");
    await page.waitForTimeout(5000); // Give time for messages to load

    console.log("Extracting latest message...");
    let lastMessage;
    try {
        lastMessage = await page.evaluate(() => {
            let messages = document.querySelectorAll(".message-in");
            if (messages.length > 0) {
                return messages[messages.length - 1].innerText;
            } else {
                return "No messages found.";
            }
        });
    } catch (error) {
        console.log("Error extracting message:", error);
        lastMessage = "Error retrieving message.";
    }

    console.log("Latest Message:", lastMessage);
    await browser.close();

    return lastMessage;
}

// Run the function
readWhatsAppMessages().then(console.log).catch(console.error);
