const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContianer = document.querySelector(".progress-container");

const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copy-btn");

const emailForm = document.querySelector("#email-form");

const baseURL = "https://morning-waters-95473.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();

  const files = e.dataTransfer.files;

  if (files.length === 1) {
    fileInput.files = files;
    uploadFile();
    dropZone.classList.remove("dragged");
  }
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
  // console.log("dropping file");
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
  console.log("drag ended");
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

copyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fileURLInput.select();
  document.execCommand("copy");
});

const uploadFile = () => {
  progressContianer.style.display = "block";
  sharingContainer.style.display = "none";
  console.log("file added uploading");

  files = fileInput.files;
  const formData = new FormData();
  formData.append("myfile", files[0]);

  const xhr = new XMLHttpRequest();

  // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      console.log(xhr.responseText);
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percent = (e.loaded / e.total) * 100;
  const percentRound = Math.round(percent);
  console.log(percent);
  bgProgress.style.width = `${percent + 1}%`;
  percentDiv.innerHTML = `${percentRound}`;
  progressBar.style.transform = `scaleX(${percent / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
  console.log(url);
  fileInput.value = "";
  emailForm.elements["to-email"].value = "";
  emailForm.elements["from-email"].value = "";
  emailForm[2].removeAttribute("disabled");
  progressContianer.style.display = "none";
  fileURLInput.value = url;
  sharingContainer.style.display = "block";
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("submit form");
  const url = fileURLInput.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  emailForm[2].setAttribute("disabled", "true");

  console.table(formData);

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ Success }) => {
      if (Success) {
        sharingContainer.style.display = "none";
      }
    });
});

// Send email to fetch API
