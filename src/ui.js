import weather from "./weatherApp";
import * as svg from "./svg";

(function() {

  const state = {
    isLoading: false,
    unit: "F"
  };

  const toggleLoading = function(bool) {
    document.querySelector(".error").style.display = "none";
    document.querySelector(".lds-default").style.display = "inline-block";
    document.querySelectorAll(".cover").forEach(cover => cover.style.display = bool ? "block" : "none");
    document.querySelector("#loading").style.visibility = bool ? "visible" : "hidden";
    state.isLoading = bool;
  };

  const switchUnits = function(unit) {
    if(state.unit !== unit) {
      document.querySelector(`svg[data-unit='${unit}']`).setAttribute("stroke", "#2e364d");
      document.querySelector(`svg[data-unit='${state.unit}']`).setAttribute("stroke", "#c9c9c9");
      document.querySelector("#big-temp").textContent = `${state["temp" + unit]}°`;

      state.unit = unit;

      document.querySelectorAll("#middle-box > div > div").forEach((hourBox, index) => {
        hourBox.querySelector(".bold.small").textContent = `${state["hourly" + state.hourlyNum][index]["temp" + unit]}°`;
      });

      document.querySelectorAll("#bottom-box > div > div").forEach((dayBox, index) => {
        dayBox.querySelector(".bold.small").textContent = `${state["weekly" + state.weeklyNum][index]["temp" + unit]}°`;
      });
    }
  };

  const addIcon = function(parent, iconName) {
    if(parent.querySelector("svg")) {
      parent.replaceChild(svg[iconName].cloneNode(true), parent.querySelector("svg"));
    }
    else {
      parent.appendChild(svg[iconName].cloneNode(true));
    }
  };

  const displayWeekly = function() {
    document.querySelectorAll("#bottom-box .slide").forEach((slide, index) => {
      if(index === state.weeklyNum) slide.setAttribute("fill", "#2e364d");
      else slide.setAttribute("fill", "#c9c9c9");
    });

    document.querySelectorAll("#bottom-box > div > div").forEach((dayBox, index) => {
      const dayData = state["weekly" + state.weeklyNum][index];
      if(dayData) {
        dayBox.querySelector(".bold.small").textContent = `${dayData["temp" + state.unit]}°`;
        addIcon(dayBox.querySelector(".small-icon"), dayData.icon)
        dayBox.querySelector(".bold.big").textContent = dayData.time;
      }
      else {
        dayBox.querySelector(".bold.small").textContent = "";
        dayBox.querySelector(".small-icon").removeChild(dayBox.querySelector(".small-icon svg"));
        dayBox.querySelector(".bold.big").textContent = "";
      }
    });
  };

  const displayHourly = function() {
    document.querySelectorAll("#middle-box .slide").forEach((slide, index) => {
      if(index === state.hourlyNum) slide.setAttribute("fill", "#2e364d");
      else slide.setAttribute("fill", "#c9c9c9");
    });

    document.querySelectorAll("#middle-box > div > div").forEach((hourBox, index) => {
      const hourData = state["hourly" + state.hourlyNum][index];
      if(hourData) {
        const [time, period] = hourData.time.split(" ");

        hourBox.querySelector(".bold.small").textContent = `${hourData["temp" + state.unit]}°`;
        addIcon(hourBox.querySelector(".small-icon"), hourData.icon)
        hourBox.querySelector(".bold.big").textContent = time;
        hourBox.querySelector(".period").textContent = period;
      }
      else {
        hourBox.querySelector(".bold.small").textContent = "";
        hourBox.querySelector(".small-icon").removeChild(hourBox.querySelector(".small-icon svg"));
        hourBox.querySelector(".bold.big").textContent = "";
        hourBox.querySelector(".period").textContent = "";
      }
    });
  }

  const displayWeather = async function(location) {
    toggleLoading(true);

    try {
      const data = await weather.getData(location);
      Object.assign(state, data);
      state.weeklyNum = 0;
      state.hourlyNum = 0;

      document.querySelector("#big-temp").textContent = `${data["temp" + state.unit]}°`;
      document.querySelector("#city").textContent = data.city;
      addIcon(document.querySelector("#big-icon"), data.icon);
    
      displayHourly();
      displayWeekly();

      toggleLoading(false);
    }
    catch(e) {
      document.querySelector(".lds-default").style.display = "none";
      document.querySelector(".error").style.display = "flex";
      state.isLoading = false;
    }
  };
  
  (async function() {
    // initialize weather screen with default
    await displayWeather("New York, NY");

    // search bar functionality
    document.querySelector("#search-box input").addEventListener("keypress", (e) => {
      if(!state.isLoading && e.key === "Enter") {
        displayWeather(e.target.value.trim());
      }
    });

    // convert between F and C
    document.querySelector("svg[data-unit='F']").addEventListener("click", (e) => switchUnits("F"));
    document.querySelector("svg[data-unit='C']").addEventListener("click", (e) => switchUnits("C"));

    // change hourly and weekly slides on dot click
    document.querySelectorAll("#middle-box .slide").forEach((slide, index) => {
      slide.addEventListener("click", (e) => {
        if(state.hourlyNum !== index) {
          state.hourlyNum = index;
          displayHourly();
        }
      });
    });
    document.querySelectorAll("#bottom-box .slide").forEach((slide, index) => {
      slide.addEventListener("click", (e) => {
        if(state.weeklyNum !== index) {
          state.weeklyNum = index;
          displayWeekly();
        }
      });
    });

    // change hourly and weekly slides on arrow click
    document.querySelector("#middle-box .left").addEventListener("click", (e) => {
      if(state.hourlyNum > 0) {
        state.hourlyNum--;
        displayHourly();
      }
    });
    document.querySelector("#middle-box .right").addEventListener("click", (e) => {
      if(state.hourlyNum < 4) {
        state.hourlyNum++;
        displayHourly();
      }
    });
    document.querySelector("#bottom-box .left").addEventListener("click", (e) => {
      if(state.weeklyNum > 0) {
        state.weeklyNum--;
        displayWeekly();
      }
    });
    document.querySelector("#bottom-box .right").addEventListener("click", (e) => {
      if(state.weeklyNum < 1) {
        state.weeklyNum++;
        displayWeekly();
      }
    });

  })();

})();