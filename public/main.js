const queryURL = document.getElementById('queryURL'),
  queryForm = document.getElementById('query-form');
  usernameElement = queryForm[0],
  fromDateElement = queryForm[1],
  toDateElement = queryForm[2],
  limitElement = queryForm[3],
  usernameRegex = /^\w{3,20}$/,
  baseURL = "https://fcc-exercise-tracker.herokuapp.com/";

let username = "",
  fromDate = "",
  toDate = "",
  limit = "";

//function to update the #queryURL
function updateQuery() {
  let newURL = baseURL;

  if(usernameRegex.test(username)) {
    newURL += `api/exercise/log?username=${username}`;

    let fromYear = fromDate.split('-')[0];
    let toYear = toDate.split('-')[0];

    if(fromYear > 1970 && fromYear < 3000 && (fromDate<toDate || toDate === "")) {
      newURL += `&from=${fromDate}`;
    }

    if(toYear > 1970 && toYear < 3000 && (toDate>fromDate || fromDate === "")) {
      newURL += `&to=${toDate}`;
    }

    if(limit>=0 && limit<10000 && typeof(limit) === 'number') {
      newURL += `&limit=${limit}`;
    }
  }

  queryURL.textContent = newURL;
  queryURL.href = newURL;
}

//listeners for input elements
usernameElement.addEventListener('keyup',  (e) => { username =          e.target.value;  updateQuery(); });
fromDateElement.addEventListener('keyup',  (e) => { fromDate =          e.target.value;  updateQuery(); });
fromDateElement.addEventListener('change', (e) => { fromDate =          e.target.value;  updateQuery(); });
toDateElement  .addEventListener('keyup',  (e) => { toDate   =          e.target.value;  updateQuery(); });
toDateElement  .addEventListener('change', (e) => { toDate   =          e.target.value;  updateQuery(); });
limitElement   .addEventListener('keyup',  (e) => { limit    = parseInt(e.target.value); updateQuery(); });
limitElement   .addEventListener('change', (e) => { limit    = parseInt(e.target.value); updateQuery(); });
