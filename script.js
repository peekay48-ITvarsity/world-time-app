
const localTime = document.getElementById("local-time");
const localDate = document.getElementById("local-date");
const citySelect = document.getElementById("city-select");
const addCityBtn = document.getElementById("add-city-btn");
const clockContainer = document.getElementById("clock-container");
const cityCount = document.getElementById("city-count");
const message = document.getElementById("message");

const cities = [
    {
        name: "Durban",
        zone: "Africa/Johannesburg"
    },
    {
        name: "London",
        zone: "Europe/London"
    },
    {
        name: "New York",
        zone: "America/New_York"
    },
    {
        name: "Tokyo",
        zone: "Asia/Tokyo"
    },
    {
        name: "Dubai",
        zone: "Asia/Dubai"
    },
    {
        name: "Sydney",
        zone: "Australia/Sydney"
    }
];

// Format a date or time for any time zone.
function formatDate(date, zone, options) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        ...options
    }).format(date);
}

// Display the user's computer's local time.
function updateLocalClock() {
    const now = new Date();

    localTime.textContent = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(now);

    localDate.textContent = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(now);
}

// Get the current UTC offset for a time zone.
function getOffset(date, zone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: zone,
        timeZoneName: "longOffset"
    }).formatToParts(date);

    return parts.find(part => part.type === "timeZoneName")?.value
        .replace("GMT", "UTC") || "UTC";
}

// Render the city cards.
function renderCities() {
    clockContainer.innerHTML = "";

    cityCount.textContent =
        `${cities.length} ${cities.length === 1 ? "CITY" : "CITIES"}`;

    if (cities.length === 0) {
        clockContainer.innerHTML = `
            <div class="empty-message">
                No cities added yet. Choose a city above to get started.
            </div>
        `;
        return;
    }

    cities.forEach((city, index) => {
        const card = document.createElement("article");
        card.className = "clock-card";
        card.dataset.zone = city.zone;

        const top = document.createElement("div");
        top.className = "card-top";

        const info = document.createElement("div");

        const name = document.createElement("h3");
        name.className = "city-name";
        name.textContent = city.name;

        const zone = document.createElement("p");
        zone.className = "city-zone";
        zone.textContent = city.zone;

        info.append(name, zone);

        const badge = document.createElement("span");
        badge.className = "day-badge";
        badge.dataset.part = "day";

        top.append(info, badge);

        const time = document.createElement("p");
        time.className = "clock-time";
        time.dataset.part = "time";

        const date = document.createElement("p");
        date.className = "clock-date";
        date.dataset.part = "date";

        const bottom = document.createElement("div");
        bottom.className = "card-bottom";

        const period = document.createElement("span");
        period.className = "day-period";
        period.dataset.part = "period";

        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.textContent = "Remove";
        remove.type = "button";
        remove.setAttribute("aria-label", `Remove ${city.name}`);
        remove.addEventListener("click", () => {
            cities.splice(index, 1);
            renderCities();
            updateClocks();
            showMessage(`${city.name} removed.`);
        });

        bottom.append(period, remove);
        card.append(top, time, date, bottom);
        clockContainer.appendChild(card);
    });

    updateClocks();
}

// Update every city's time without rebuilding the cards.
function updateClocks() {
    const now = new Date();

    document.querySelectorAll(".clock-card").forEach(card => {
        const zone = card.dataset.zone;

        try {
            const time = formatDate(now, zone, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

            const date = formatDate(now, zone, {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            const hour = Number(formatDate(now, zone, {
                hour: "numeric",
                hour12: false
            }));

            card.querySelector('[data-part="time"]').textContent = time;
            card.querySelector('[data-part="date"]').textContent = date;
            card.querySelector('[data-part="period"]').textContent =
                hour >= 5 && hour < 12 ? "Morning" :
                hour >= 12 && hour < 17 ? "Afternoon" :
                hour >= 17 && hour < 21 ? "Evening" : "Night";

            card.querySelector('[data-part="day"]').textContent =
                formatDate(now, zone, {
                    day: "numeric"
                }) !== formatDate(now, "UTC", {
                    day: "numeric"
                }) ? "Different day" : "Today";

            // Show the current UTC offset, including daylight saving.
            card.querySelector(".city-zone").textContent =
                `${zone} · ${getOffset(now, zone)}`;

        } catch (error) {
            card.querySelector('[data-part="time"]').textContent =
                "Time unavailable";
        }
    });
}

// Add a new city from the dropdown.
function addCity() {
    const zone = citySelect.value;

    if (!zone) {
        showMessage("Please choose a city first.");
        return;
    }

    if (cities.some(city => city.zone === zone)) {
        showMessage("This city is already on your clock list.");
        return;
    }

    const selectedOption =
        citySelect.options[citySelect.selectedIndex];

    let name = selectedOption.textContent.split(" / ")[0];

    if (zone === "Africa/Johannesburg") {
        name = "Johannesburg";
    }

    cities.push({ name, zone });

    renderCities();
    citySelect.value = "";
    showMessage(`${name} added successfully.`);
}

function showMessage(text) {
    message.textContent = text;
}

// Start the app.
addCityBtn.addEventListener("click", addCity);

citySelect.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addCity();
    }
});

renderCities();
updateLocalClock();

setInterval(() => {
    updateLocalClock();
    updateClocks();
}, 1000);
