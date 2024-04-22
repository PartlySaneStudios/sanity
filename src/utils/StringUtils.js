//
// Written by Su386'and J10a1n15.
// See LICENSE for copyright and license notices.
//


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('en-UK', options).format(date);
}

exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.formatDate = formatDate