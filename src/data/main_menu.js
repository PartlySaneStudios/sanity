exports.getAnnouncements = async function getAnnouncements() {
  const response = await this.getMainMenuJson()

  return response.announcements
}
const config = require("../config/config.json")

exports.getMainMenuJson = async function getData() {
  try {
    // Fetch the file content from GitHub API
    const response = await fetch(`https://api.github.com/repos/${config.data.user}/${config.data.repo}/contents/data/main_menu.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Get the response as JSON
    const data = await response.json();

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
  const response = await fetch(`https://api.github.com/repos/${config.data.user}/${config.data.repo}/contents/data/main_menu.json`);
  const data = await response.json();
  
  // Extract the SHA value from the response
  return data.sha;
}
