exports.getAnnouncements = async function getAnnouncements() {
  const response = await (await fetch('https://raw.githubusercontent.com/PartlySaneStudios/partly-sane-skies-public-data/main/data/main_menu.json')).json();

  return response.announcements
}
