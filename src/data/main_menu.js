//
// Written by Su386.
// See LICENSE for copyright and license notices.
//


const SystemUtils = require('../utils/SystemUtils');

const owner = process.env.OWNER;
const repo = process.env.REPO;
const path = 'data/main_menu.json';

// Returns an object with json and sha keys
exports.getMainMenuData = async function getMainMenuData() {
  const data = await SystemUtils.getData(path, owner, repo);

  const sha = data.sha;

  // Decode the content from Base64 to UTF-8
  const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');

  // Parse the JSON string to a JavaScript object
  const jsonData = JSON.parse(decodedContent);
  console.log(jsonData)

  return { json: jsonData, sha: sha }
}

exports.getAnnouncements = async function getAnnouncements() {
  const response = await this.getMainMenuJson()

  return response.announcements
}

exports.getMainMenuJson = async function getData() {
  const data = await SystemUtils.getData(path, owner, repo);

  // Decode the content from Base64 to UTF-8
  const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');

  // Parse the JSON string to a JavaScript object
  const jsonData = JSON.parse(decodedContent);

  return jsonData;
};


exports.getSHA = async function getSHA() {
  const data = await SystemUtils.getData(path, owner, repo);

  // Extract the SHA value from the response
  return data.sha;
}
