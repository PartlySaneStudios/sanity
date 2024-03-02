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