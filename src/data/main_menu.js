const { Octokit } = require('@octokit/rest');


// Returns an object with json and sha keys
exports.getMainMenuData = async function getMainMenuData() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    const sha = response.data.sha;
    
    // Decode the content from Base64 to UTF-8
    const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

    // Parse the JSON string to a JavaScript object
    const jsonData = JSON.parse(decodedContent);
    console.log(jsonData)

    return { json: jsonData, sha:sha }
    // Extract the SHA value from the response

  }
  catch (error) {
    console.error('Error fetching or decoding file content:', error);
    throw error; // Re-throw the error to signal that something went wrong
  }
}
exports.getAnnouncements = async function getAnnouncements() {
  const response = await this.getMainMenuJson()

  return response.announcements
}
const config = require("../config/config.json")

exports.getMainMenuJson = async function getData() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Get the response as JSON
    const data = response.data;

    // Decode the content from Base64 to UTF-8
    const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');

    // Parse the JSON string to a JavaScript object
    const jsonData = JSON.parse(decodedContent);

    return jsonData;
  } catch (error) {
    console.error('Error fetching or decoding file content:', error);
    throw error; // Re-throw the error to signal that something went wrong
  }
};


exports.getSHA = async function getSHA() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    const data = response.data;
    
    
    // Extract the SHA value from the response
    return data.sha;
  }
  catch (error) {
    console.error('Error fetching or decoding file content:', error);
    throw error; // Re-throw the error to signal that something went wrong
  }
}
