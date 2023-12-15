//
// Written by Su386'and J10a1n15.
// See LICENSE for copyright and license notices.
//


const { Octokit } = require('@octokit/rest');
const { JSDOM } = require('jsdom');
const config = require("../config/config.json");

async function getUrlContent(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch website. Status: ${response.status}`);
        }

        const htmlCode = await response.text();
        return htmlCode;
    } catch (error) {
        console.error(`Error fetching website: ${error.message}`);
        return null;
    }
}

function getElementFromHtml(htmlCode, className) {
    const dom = new JSDOM(htmlCode);
    const document = dom.window.document;
  
    // Find the title element using its class name
    const titleElement = document.querySelector(className);
  
    if (titleElement) {
      // Extract and return the text content of the title element
      return titleElement.textContent.trim();
    } else {
      return null; // Title element not found
    }
}

async function sendRequest(path, commitName, commitAuthor, content, sha) {
    // Creates a request to send to github
    const owner = config.data.user;
    const repo = config.data.repo;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });


    return octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
        owner: owner,
        repo: repo,
        path: path,
        message: commitName, // Commit title
        committer: { // Commit info
            name: `Su386's Bot (@${commitAuthor} through discord)`,
            email: `153068057+Su286@users.noreply.github.com`
        },
        content: Buffer.from(JSON.stringify(content, null, 4)).toString("base64"), // Commit content
        sha: sha,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
        .then(response => {
            console.log(response)
            return [response, null];
        })
        .catch(error => {
            return [null, error];
        });
}

exports.sendRequest = sendRequest
exports.getUrlContent = getUrlContent
exports.getElementFromHtml = getElementFromHtml
