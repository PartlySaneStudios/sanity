//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const SystemUtils = require('../utils/SystemUtils');

const serverUrl = process.env.SERVER_URL;

exports.getStatus = async function () {
  try {
    const url = `${serverUrl}/v1/status`
    const response = await fetch(url);

    return response;
  }
  catch (error) {
    return null;
  }
};

exports.getDailyFunFact = async function () {
  try {
    const url = `${serverUrl}/v1/pss/funfact`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data.funFact;
    } else {
      console.error('Failed to fetch daily fun fact:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching daily fun fact:', error);
    return null;
  }
}