const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

function getRandomProxy() {
  // Read the proxy list from the file
  const proxies = fs.readFileSync('blesstool/proxy.txt', 'utf-8').split('\n').filter(Boolean);
  
  // Choose a random proxy
  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];

  return randomProxy;
}



// Function to fetch OTP from the API using email and password
async function getOtpFromApi(email, password) {
  let retries = 5; // Number of retries
  let otp = null;
  
  
  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(`Attempt ${attempt}: Requesting OTP for email: ${email}`);
      const response = await axios.post('http://localhost:3456/latest-otps', {
        emails: [{ email: email, password: password }]
      });

      // Extract OTP from the response object
      if (response.status === 200 && response.data && response.data[email]) {
        otp = response.data[email]?.otp;  // Fetch OTP from the email key
        if (otp) {
          console.log(`OTP received: ${otp}`);
          return otp; // Return OTP if found
        } else {
          console.error('OTP not found in the response');
        }
      }

      // Retry after 3 seconds if OTP is not found
      console.log('Retrying in 3 seconds...');
      await sleep(3000); 
    }
  } catch (error) {
    console.error('Error fetching OTP:', error);
  }
  return null; // Return null if no OTP is fetched after retries
}

async function getOtpBiz(driver, email, password) {
  let otp = null;
  try {
    // Open a new tab and navigate to the mail login page
    await driver.executeScript('window.open("about:blank", "_blank");');
    const tabs = await driver.getAllWindowHandles();
    await driver.switchTo().window(tabs[1]);
    await driver.get('https://id.bizflycloud.vn/login?service=https%3A%2F%2Fmail.bizflycloud.vn%2F&_t=webmail'); // Replace with the actual mail service URL

    console.log('Wait for and enter the email');
    const emailField = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div/main/div/div/div/div[1]/div/div/div/div/div[1]/form/div[1]/div/div/input')), // Replace with appropriate selector
      20000
    );
    await emailField.sendKeys(email);
    await driver.sleep(500);

    const nextButton = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div/main/div/div/div/div[1]/div/div/div/div/div[1]/form/div[1]/div/button/span/div/div/i')), // Replace with appropriate selector
      20000
    );
    await nextButton.click();

    await driver.sleep(5000);

    console.log('Wait for and enter the password');
    const passwordField = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div/main/div/div/div/div/div/div/div/div/div[2]/form/div/div/div/input')), // Replace with appropriate selector
      20000
    );
    await passwordField.sendKeys(password);
    await driver.sleep(2000);
    
    console.log('x');
    // const loginButton = await driver.wait(
    //   until.elementLocated(By.xpath('//*[@id="app"]/div/div/main/div/div/div/div/div/div/div/div/div[2]/form/div/div/div/div/button')), // Replace with appropriate selector
    //   20000
    // );
    // await loginButton.click();
    // await inputField1.sendKeys(Key.TAB);
    await passwordField.sendKeys(Key.ENTER);
    console.log('y');


    console.log('Wait for the inbox to load');
    await driver.wait(
      until.elementLocated(By.xpath('//*[@id="sidebar"]/div[2]/div[1]/div/div/li[1]/div/div/span[1]')), // Replace with appropriate selector for the latest email
      20000
    );

    console.log('Wait for the latest email and click it');
    const latestEmail = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="threads_list"]/div[1]')), // Replace with appropriate selector for the latest email
      20000
    );
    await latestEmail.click();

    console.log('Wait for the email content to load');
    const emailContent = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div/div[3]/div/div[2]/h4')), // Replace with the correct selector for email content
      20000
    );

    console.log('Extract the OTP from the email content');
    const emailText = await emailContent.getText();
    const otpMatch = emailText.match(/\b\d{6}\b/); // Assuming the OTP is a 6-digit number
    if (otpMatch) {
      otp = otpMatch[0];
    }
  } catch (error) {
    console.error('Error extracting OTP:', error);
  } finally {
    return otp;
  }
}

async function getOtpVeer(driver, email, password) {
  let otp = null;
  try {
    // Open a new tab and navigate to the mail login page
    await driver.executeScript('window.open("https://mail.veer.vn");');
    const tabs = await driver.getAllWindowHandles();
    await driver.switchTo().window(tabs[1]);

    // Wait for and enter the email
    const emailField = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div[1]/div[2]/div/div[2]/div/div[2]/form/div[1]/input')), // Replace with appropriate selector
      20000
    );
    await emailField.sendKeys(email);

    // Wait for and enter the password
    const passwordField = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div[1]/div[2]/div/div[2]/div/div[2]/form/div[2]/input')), // Replace with appropriate selector
      20000
    );
    await passwordField.sendKeys(password);

    await driver.sleep(500);
    // Wait for and click the next button after password
    const loginButton = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="app"]/div/div[1]/div[2]/div/div[2]/div/div[2]/form/div[3]/button')), // Replace with appropriate selector
      20000
    );
    await loginButton.click();

    // Wait for the inbox to load
    const inbox = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="mail-box-toggle"]/div[2]/div/div[2]/div[1]/div/div/div/div/div[1]/ul/li[1]')), // Replace with appropriate selector
      20000
    );

    // Wait for the latest email and click it
    const latestEmail = await driver.wait(
      until.elementLocated(By.id('mail-item-0')), // Replace with appropriate selector for the latest email
      20000
    );
    await latestEmail.click();

    // await driver.sleep(2000000)

    // Wait for the email content to load
    const emailContent = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="mail-box-toggle"]/div[3]/div/div[2]/div/div[1]/h2')), // Replace with the correct selector for email content
      20000
    );

    // Extract the OTP from the email content
    const emailText = await emailContent.getText();
    const otpMatch = emailText.match(/\b\d{6}\b/); // Assuming the OTP is a 6-digit number
    if (otpMatch) {
      otp = otpMatch[0];
    }
  } catch (error) {
    console.error('Error extracting OTP:', error);
  } finally {
    return otp;
  }
}


async function getTokenAndPubKey(email, password) {
  let driver;
  try {
    // Set up Chrome options to include the extension (bless.crx)
    const proxy = getRandomProxy();
    console.log('Using proxy:', proxy);

    const chromeOptions = new chrome.Options();
    chromeOptions.addExtensions(['./bless.crx']);
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--window-size=1920x1080');

    // Enable cookies and JavaScript execution (this is default in headless mode)
    chromeOptions.addArguments('--enable-cookies');
    chromeOptions.addArguments('--enable-javascript');

    // Add custom headers (from the curl command)
    chromeOptions.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    chromeOptions.addArguments('accept=text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
    chromeOptions.addArguments('accept-language=en-US,en;q=0.9');
    chromeOptions.addArguments('priority=u=0, i');
    chromeOptions.addArguments('sec-ch-ua="Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"');
    chromeOptions.addArguments('sec-ch-ua-mobile=?0');
    chromeOptions.addArguments('sec-ch-ua-platform="Windows"');
    chromeOptions.addArguments('sec-fetch-dest=document');
    chromeOptions.addArguments('sec-fetch-mode=navigate');
    chromeOptions.addArguments('sec-fetch-site=none');
    chromeOptions.addArguments('sec-fetch-user=?1');
    chromeOptions.addArguments('upgrade-insecure-requests=1');
    chromeOptions.setChromeBinaryPath('/usr/bin/chromium-browser');

    // Initialize the WebDriver with the chrome options including the extension
    driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

    // Go to the form page
    console.log('Navigating to the website...');
    await driver.get('https://bless.network/dashboard?ref=Y06FN1');

    await sleep(5000);

    console.log('Waiting for email input field...');
    // Wait for the email input field
    await driver.wait(until.elementLocated(By.xpath('//*[@id="email"]')), 20000);
    let emailInput = await driver.wait(until.elementLocated(By.xpath('//*[@id="email"]')), 20000);
    console.log('Entering email...');
    await emailInput.sendKeys(email);

    // Press 'Tab' and 'Enter' to submit the form
    console.log('Submitting the form...');
    await emailInput.sendKeys(Key.TAB, Key.RETURN);

    // Wait for OTP input window to pop up
    console.log('Waiting for OTP input window...');
    await sleep(60000);  // Allow 45 seconds for OTP to arrive

    // Call the API to get the OTP
    console.log('Calling FUNCTION to get OTP...');
    const domain = email.split('@')[1];
    let otp = '';
    // Determine the host based on the domain
    if (domain === 'veer.vn') {
      otp = await getOtpVeer(driver, email, password);
    } else if (domain === 'tourzy.us' || domain === 'dealhot.vn') {
      otp = await getOtpBiz(driver, email, password);
    } else {
      throw new Error('Unsupported email domain');
    }
    
    console.log('OTP: ', otp)

    // If OTP is found, proceed to fill it in the OTP field
    if (otp !== null) {
      console.log('OTP found, filling in the OTP...');
      // Switch to the OTP input window (pop-up)
      let windows = await driver.getAllWindowHandles();
      console.log('Switching to OTP input window...');
      await driver.switchTo().window(windows[2]);

      // Wait for OTP input to appear and fill in the OTP
      await driver.wait(until.elementLocated(By.xpath('//*[@id="app"]/div/div/div/div/div[3]/div/form/input[1]')), 20000);
      let otpInput = await driver.wait(until.elementLocated(By.xpath('//*[@id="app"]/div/div/div/div/div[3]/div/form/input[1]')), 20000);
      await otpInput.sendKeys(otp);

      // Switch back to the main window
      console.log('Switching back to main window...');
      await driver.switchTo().window(windows[0]);

      // Wait for the dashboard to load
      console.log('Waiting for dashboard to load...');
      await driver.wait(until.elementLocated(By.xpath('/html/body/div/main/div/div[1]/h1')), 999999);

      // Optionally, refresh the page if necessary
      console.log('Refreshing the page...');
      await driver.navigate().refresh();

      // After seeing the dashboard, start refreshing until the token is found
      let token = null;
      let attempts = 0;

      while (attempts < 7) {
        // Sleep for 5 seconds before checking for the token
        await sleep(5000);

        // Extract the token from localStorage
        token = await driver.executeScript('return window.localStorage.getItem("B7S_AUTH_TOKEN");');

        // Check if the token is found and not equal to 'ERROR'
        if (token && token !== 'ERROR') {
          console.log('Token from localStorage:', token);
          break;  // Exit the loop when a valid token is found
        } else {
          console.log('Token not found or is ERROR, retrying...');
        }

        // Refresh the page and retry
        await driver.navigate().refresh();
        attempts++;
      }

      if (attempts === 7) {
        console.log('Token not found after 7 attempts.');
        throw new Error('Token not found after 100 attempts');
      }

      // Now fetch the pubKey using the token
      const pubKey = await getPubKeyFromToken(token);

      // Return both token and pubKey
      return { token, pubKey };
    } else {
      throw new Error('OTP not found');
    }

  } catch (err) {
    console.error('Error in script execution:', err);
    throw new Error('Internal server error');
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}


async function getPubKeyFromToken(token) {
  const maxRetries = 10;  // Set maximum number of retries
  const retryDelay = 20000;  // Set retry delay in milliseconds (10 seconds)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Fetching pubKey for token...`);

      // Make the GET request to retrieve the nodes using the provided token
      const response = await axios.get('https://gateway-run.bls.dev/api/v1/nodes', {
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json',
          'origin': 'https://bless.network',
          'priority': 'u=1, i',
          'referer': 'https://bless.network/',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
      });

      // Check if the response data is an array and contains at least one node
      if (Array.isArray(response.data) && response.data.length > 0) {
        const node = response.data[0];  // Select the first node
        const pubKey = node.pubKey;  // Extract the pubKey from the node
        console.log(`Public Key fetched successfully: ${pubKey}`);  // Log the public key
        return pubKey;  // Return the pubKey
      } else {
        throw new Error('No nodes found in the response.');
      }
    } catch (error) {
      console.error(`Error fetching pubKey on attempt ${attempt}:`, error.message);

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error('Max retries reached, unable to fetch pubKey.');
        throw new Error('Unable to fetch pubKey after multiple attempts');
      }

      // Wait for the specified delay before retrying
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}


// Utility function to pause execution for a specified amount of time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getTokenAndPubKey }; // Export the combined function for use in app.js
