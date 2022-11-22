import './style.css'
import { TempusDominus } from '@eonasdan/tempus-dominus';

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
    <div class="input-group mb-3">
      <input id="outputTextfield" type="text" class="form-control" placeholder="" aria-label="Recipient's username" aria-describedby="button-addon2">
      <button class="btn btn-outline-light" type="button" id="outputCopyButton">
        <span class="fa-regular fa-copy"></span>
      </button>
    </div>
  </div>
  
</div>
`

const TIME_TYPE = {
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

const picker = new TempusDominus(document.getElementById('datetimepicker1'), {
  display: {
    components: {
      seconds: true,
    },
  },
});

/**
 * @param {number} num
 * @param {number} type
 */
function convertArabicNumbertoCantoNumber(num, type) {
  const CANTO_NUMS = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];

  // year
  if (type === 0) {
    return CANTO_NUMS[Math.floor(num / 1000)]
      + CANTO_NUMS[Math.floor((num % 1000) / 100)]
      + CANTO_NUMS[Math.floor((num % 100) / 10)]
      + CANTO_NUMS[Math.floor(num % 10)];
  }

  // month, day, hour || minute, second
  if (type === 1 || type === 2) {
    if (num === 0) return '零';
    if (num < 10) return type === 1 ? CANTO_NUMS[num] : `零${CANTO_NUMS[num]}`;
    if (num < 20) return num === 10 ? '拾' : `拾${CANTO_NUMS[num % 10]}`;
    if (num < 100) {
      return (num % 10 === 0)
        ? `${CANTO_NUMS[Math.floor(num / 10)]}拾`
        : `${CANTO_NUMS[Math.floor(num / 10)]}拾${CANTO_NUMS[num % 10]}`;
    }
  }
  return '???';
}

/**
 * @param {Date} now
 */
function displayIsoDate(now) {
  // document.getElementById('isoTime').innerHTML = now.toLocaleString();
  document.getElementById('datetimepicker1Input').placeholder = now.toLocaleString();
}

/**
 * @param {Date} now
 */
function displayCantoDate(now) {
  let convertedTimeString = '';
  const ampm = now.getHours() >= 12 ? '下午' : '上午';
  const realHour = now.getHours() > 12
    ? now.getHours() - 12
    : now.getHours();

  convertedTimeString += `${convertArabicNumbertoCantoNumber(now.getFullYear(), TIME_TYPE.year)}年`;
  convertedTimeString += `${convertArabicNumbertoCantoNumber(now.getMonth() + 1, TIME_TYPE.month)}月`;
  convertedTimeString += `${convertArabicNumbertoCantoNumber(now.getDate(), TIME_TYPE.day)}日`;
  convertedTimeString += `${ampm + convertArabicNumbertoCantoNumber(realHour, TIME_TYPE.hour)}時`;
  convertedTimeString += `${convertArabicNumbertoCantoNumber(now.getMinutes(), TIME_TYPE.minute)}分`;
  convertedTimeString += useSecond
    ? `${convertArabicNumbertoCantoNumber(now.getSeconds(), TIME_TYPE.second)}秒`
    : '';

  // document.getElementById('convertedDate').innerHTML = convertedTimeString;
  document.getElementById('outputTextfield').value = convertedTimeString;
}

/**
 * @param {import("@eonasdan/tempus-dominus").DateTime} pickedTime
 */
function displayPickedTime(pickedTime) {
  displayIsoDate(pickedTime);
  displayCantoDate(pickedTime);
}

function displayCurrentTime() {
  const time = new Date();

  displayIsoDate(time);
  displayCantoDate(time);
}

function runDecoupledClock() {
  clearInterval(realTimeClock);
  console.log('clock decoupled');

  const pickedTime = picker.dates.lastPicked;
  // pickedTime.setSeconds(0);
  console.log(`manually picked time is ${pickedTime}`);
  displayPickedTime(pickedTime);
}

function runClock() {
  if (realTimeMode) {
    console.log('RT clock running');
    realTimeClock = setInterval(() => {
      displayCurrentTime();
    }, 1000);
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
    console.error('cannot copy', error);
    document.getElementById('output').querySelector('span').className = 'fa-solid fa-xmark';
    returnCopyBtnBackToOriginal();
  }
}

window.onload = () => {
  const dateTimePickerInput = document.getElementById('datetimepicker1Input');
  dateTimePickerInput.addEventListener('change', () => {
    const pickedTime = picker.dates.lastPicked;
    realTimeMode = pickedTime === undefined;
    runClock();
  });

  document.getElementById('dateTimePickerReset').addEventListener('click', () => {
    picker.dates.clear();
    dateTimePickerInput.value = '';
    realTimeMode = true;
    displayCurrentTime();
    runClock();
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
