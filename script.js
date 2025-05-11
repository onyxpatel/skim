

const apiKey = "b1a3d7c8-2d18-11f0-bd39-0242ac130003-b1a3d82c-2d18-11f0-bd39-0242ac130003";

const beaches = [
  { name: "🌴 Sebastian Inlet", lat: 27.8606, lng: -80.4467 },
  { name: "🏄 Cocoa Beach", lat: 28.3200, lng: -80.6076 },
  { name: "🐚 Indian Rocks Beach", lat: 27.8992, lng: -82.8476 },
  { name: "🐬 Madeira Beach", lat: 27.7986, lng: -82.7971 },
  { name: "☀️ Treasure Island Beach", lat: 27.7703, lng: -82.7685 },
];

const beachList = document.getElementById("beachList");
const waveResult = document.getElementById("waveResult");

beaches.forEach((beach) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <button class="w-full bg-white border border-blue-200 rounded-lg shadow hover:bg-blue-100 px-4 py-3 text-left">
      ${beach.name}
    </button>
  `;
  li.querySelector("button").addEventListener("click", () => getWaveHeight(beach));
  beachList.appendChild(li);
});

async function getWaveHeight(beach) {
  waveResult.textContent = "Fetching wave height...";
  const url = `https://api.stormglass.io/v2/weather/point?lat=${beach.lat}&lng=${beach.lng}&params=waveHeight`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    });
    const data = await response.json();
    const wave = data.hours[0]?.waveHeight?.noaa;

    if (wave !== undefined) {
      const waveInFeet = (wave * 3.28084).toFixed(2);  // Convert meters to feet
      waveResult.innerHTML = `${beach.name}: 🌊 Wave Height is ${waveInFeet} feet`;
    } else {
      waveResult.textContent = "Wave data not available.";
    }
  } catch (err) {
    waveResult.textContent = "Failed to fetch wave data.";
    console.error(err);
  }
}
