const fs = require('fs');
const axios = require('axios');

// Utility function to sleep for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to process each account asynchronously
async function processAccount(account) {
  const [email, password] = account.split(':');

  if (!email || !password) {
    console.error(`Invalid account format (missing email or password): ${account}`);
    return null; // Return null if account format is invalid
  }

  console.log(`Processing account: ${email}`);

  // Prepare the request body
  const requestBody = {
    email,
    password,
  };

  try {
    console.log(`Making API request for email: ${email}`);
    const response = await axios.post('http://localhost:3456/get-token-and-pubkey', requestBody);

    if (response.data) {
      const { token, pubKey } = response.data;
      console.log(`Received response for email: ${email}`);

      if (token && pubKey) {
        console.log(`Successfully retrieved token and pubKey for ${email}`);
        return { email, token, pubKey };
      } else {
        console.error(`Failed to get valid token and pubKey for ${email}`);
      }
    } else {
      console.error(`No response data for ${email}`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${email}:`, error.message);
  }
  
  return null; // Return null in case of failure
}

// Main function to read accounts and fetch tokens and pubKeys asynchronously
async function getAccountData() {
  try {
    console.log('Starting to read accounts from "accounts.txt"...');
    // Read the accounts from the 'accounts.txt' file
    const accounts = fs.readFileSync('accounts.txt', 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    console.log(`Found ${accounts.length} accounts in "accounts.txt".`);

    const results = [];
    for (const account of accounts) {
      const result = await processAccount(account);
      if (result !== null) {
        results.push(result);
      }

      // Wait for 1 minute before processing the next account
      console.log('Waiting for 1 minute before processing the next account...');
      await sleep(500);
    }

    // Extract idNodes (pubKeys) and configTokens (tokens)
    const idNodes = results.map(result => result.pubKey);
    const configTokens = results.map(result => result.token);

    // Write the results to idnode.txt and config.txt
    if (idNodes.length > 0) {
      fs.writeFileSync('idnode.txt', idNodes.join('\n'), 'utf-8');
      console.log('idnode.txt has been updated with pubKeys.');
    } else {
      console.log('No pubKeys retrieved, idnode.txt not updated.');
    }

    if (configTokens.length > 0) {
      fs.writeFileSync('config.txt', configTokens.join('\n'), 'utf-8');
      console.log('config.txt has been updated with tokens.');
    } else {
      console.log('No tokens retrieved, config.txt not updated.');
    }

  } catch (error) {
    console.error('Error processing accounts:', error.message);
  }
}

// Run the function
console.log('Starting the account data retrieval process...');
getAccountData();
