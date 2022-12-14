import './style.css';
import customDateFormat from '@eonasdan/tempus-dominus/dist/plugins/customDateFormat';
// eslint-disable-next-line no-undef
tempusDominus.extend(customDateFormat);

document.querySelector('#app').innerHTML = `
<div>
  <div id="input">

    <div class = "input-group log-event"
         id = "datetimepicker1"
         data-td-target-input = "nearest"
         data-td-target-toogle = "nearest"
         >
      <input
        id="datetimepicker1Input"
        type="text"
        class="form-control"
        placeholder=""
        data-td-target="#datetimepicker1"
        />
      <span
        class="input-group-text"
        data-td-input="#datetimepicker1"
        data-td-toogle="datatimepicker"
        >
        <span class="fa-solid fa-calendar"></span>
      </span>
    </div>

    <div class="container"> 
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="useSecondSwitch" checked>
        <label class="form-check-label" for="flexSwitchCheckChecked">Seconds</label>
      </div>
    
      <button type="button" class="btn btn-primary" id="dateTimePickerReset"
        style="margin: 20px;">Reset</button>
    </div>

  <div id="output">
    <div class="input-group flex-wrap mb-3">
      <input id="outputTextfield" type="text" class="form-control form-control-sm fw-bold" aria-label="readonly input example" readonly>
      <button class="btn btn-outline-light" type="button" id="outputCopyButton">
        <span class="fa-regular fa-copy"></span>
      </button>
    </div>
  </div>
  
</div>
`;

const time_type = {
  year: 0,
  month: 1,
  day: 1,
  hour: 1,
  minute: 2,
  second: 2,
};

let realTimeMode = true;
let realTimeClock = null;
let useSecond = true;

// eslint-disable-next-line no-undef
const picker = new tempusDominus.TempusDominus(document.getElementById('datetimepicker1'), {
  display: {
    components: {
      seconds: true,
    },
  },
  localization: {
    locale: 'en-HK',
    format: 'yyyy-MM-dd HH:mm:ss'
  }
});

function convertArabicNumbertoCantoNumber(num, type) {
  const CANTO_NUMS = ['???', '???', '???', '???', '???', '???', '???', '???', '???', '???'];

  // year
  if (type === 0) {
    return CANTO_NUMS[Math.floor(num / 1000)]
      + CANTO_NUMS[Math.floor((num % 1000) / 100)]
      + CANTO_NUMS[Math.floor((num % 100) / 10)]
      + CANTO_NUMS[Math.floor(num % 10)];
  }

  // everything else
  if (type === 1 || type === 2) {
    if (num === 0) return '???';
    if (num < 10) return type === 1 ? CANTO_NUMS[num] : `???${CANTO_NUMS[num]}`;
    if (num < 20) return num === 10 ? '???' : `???${CANTO_NUMS[num % 10]}`;
    if (num < 100) {
      return (num % 10 === 0)
        ? `${CANTO_NUMS[Math.floor(num / 10)]}???`
        : `${CANTO_NUMS[Math.floor(num / 10)]}???${CANTO_NUMS[num % 10]}`;
    }
  }
  return '???';
}

function padZeroToNumber(num) {
  return num < 10 ? '0'+num : num;
}

function timeToString(time) {
  let string = '';

  string += `${time.getFullYear()}-`;
  string += `${padZeroToNumber(time.getMonth()+1)}-`;
  string += `${padZeroToNumber(time.getDate())} `;
  string += `${padZeroToNumber(time.getHours())}:`;
  string += `${padZeroToNumber(time.getMinutes())}:`;
  string += `${padZeroToNumber(time.getSeconds())}`;
  
  return string;
}

function displayIsoDate(time) {
  document.getElementById('datetimepicker1Input').placeholder = timeToString(time);
}

function displayCantoDate(time) {
  let convertedTimeString = '';
  const ampm = time.getHours() >= 12 ? '??????' : '??????';
  const realHour = time.getHours() > 12
    ? time.getHours() - 12
    : time.getHours();

  convertedTimeString += `${convertArabicNumbertoCantoNumber(time.getFullYear(), time_type.year)}???`;
  convertedTimeString += `${convertArabicNumbertoCantoNumber(time.getMonth() + 1, time_type.month)}???`;
  convertedTimeString += `${convertArabicNumbertoCantoNumber(time.getDate(), time_type.day)}???`;
  convertedTimeString += `${ampm + convertArabicNumbertoCantoNumber(realHour, time_type.hour)}???`;
  convertedTimeString += `${convertArabicNumbertoCantoNumber(time.getMinutes(), time_type.minute)}???`;
  convertedTimeString += useSecond
    ? `${convertArabicNumbertoCantoNumber(time.getSeconds(), time_type.second)}???`
    : '';

  document.getElementById('outputTextfield').value = convertedTimeString;
}

function displayPickedTime(pickedTime) {
  displayIsoDate(pickedTime);
  displayCantoDate(pickedTime);
}

function displayCurrentTime() {
  const now = new Date();

  displayIsoDate(now);
  displayCantoDate(now);
}

function runDecoupledClock() {
  clearInterval(realTimeClock);
  console.log('clock decoupled');

  const pickedTime = picker.dates.lastPicked;
  console.log(`manually picked time is ${pickedTime}`);
  displayPickedTime(pickedTime);
}

function runClock() {
  if (realTimeMode) {
    realTimeClock = setInterval(() => {
      displayCurrentTime();
    }, 1000);
    console.log(`spawned RT clock interval timer with ID: ${realTimeClock}`);
  } else {
    runDecoupledClock();
  }
}

function returnCopyBtnBackToOriginal() {
  setTimeout(() => {
    document.getElementById('output').querySelector('span').className = 'fa-regular fa-copy';
  }, 1500);
}

async function copyContent(outputText) {
  try {
    await navigator.clipboard.writeText(outputText);
    console.log(`copied "${outputText}"`);
    document.getElementById('output').querySelector('span').className = 'fa-solid fa-check';
    returnCopyBtnBackToOriginal();
  } catch (error) {
    console.error('cannot copy, ', error);
    document.getElementById('output').querySelector('span').className = 'fa-solid fa-xmark';
    returnCopyBtnBackToOriginal();
  }
}

window.onload = () => {
  const dateTimePickerInput = document.getElementById('datetimepicker1Input');
  dateTimePickerInput.addEventListener('change', () => {
    const pickedTime = picker.dates.lastPicked;
    console.log(pickedTime);
    realTimeMode = pickedTime === undefined;
    runClock();
  });

  document.getElementById('dateTimePickerReset').addEventListener('click', () => {
    // button becomes useless if inside conditional and user needs to clear the textbox
    dateTimePickerInput.value = '';
    
    // button should only work when clock isn't already running real time,
    // otherwise will spawn too many `setInterval`s via runClock()
    if (!realTimeMode) {
      // clearing picker must be inside conditional otherwise you get more
      // setIntervals for whatever reason
      picker.dates.clear();
      realTimeMode = true;
      displayCurrentTime();
      runClock();
    }
  });

  document.getElementById('outputCopyButton').addEventListener('click', () => {
    const outputText = document.getElementById('outputTextfield').value;
    copyContent(outputText);
  });

  document.getElementById('useSecondSwitch').addEventListener('change', () => {
    useSecond = !useSecond;
    if (realTimeMode) {
      displayCurrentTime();
    } else {
      displayPickedTime(picker.dates.lastPicked);
    }
  });

  displayCurrentTime();
  runClock();
};
