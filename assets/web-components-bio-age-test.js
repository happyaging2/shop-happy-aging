class BioAgeTest extends HTMLElement {
  constructor() {
    super();

    this.data = {
      status: {
        expected: "",
        code: "",
      },
      results: [],
    };
  }

  connectedCallback() {
    this.fetchData();
  }

  fetchData() {

    function setItems(status) {
      document.querySelector('.bio-age-test__status-bar-item:nth-child(1)').classList.add('bio-age-test__status-bar-item--active');

      if (status == 'Sample Received') {
        document.querySelector('.bio-age-test__status-bar-item:nth-child(2)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(3)').classList.add('bio-age-test__status-bar-item--active');
      }
      if (status == 'Extract DNA') {
        document.querySelector('.bio-age-test__status-bar-item:nth-child(2)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(3)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(4)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(5)').classList.add('bio-age-test__status-bar-item--active');
      }
      if (status == 'Result Ready') {
        document.querySelector('.bio-age-test__status-bar-item:nth-child(2)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(3)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(4)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(5)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(6)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(7)').classList.add('bio-age-test__status-bar-item--active');
      }
      if (status == 'Report Ready') {
        document.querySelector('.bio-age-test__status-bar-item:nth-child(2)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(3)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(4)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(5)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(6)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(7)').classList.add('bio-age-test__status-bar-item--active');
        document.querySelector('.bio-age-test__status-bar-item:nth-child(8)').classList.add('bio-age-test__status-bar-item--active');
      }

    }

      function formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        const day = date.getDate();
      
        const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                       (day % 10 === 2 && day !== 12) ? 'nd' :
                       (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        
        return `${formattedDate}${suffix}`;
      }
    
      function getDateWithOffset(dateStr, days) {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return formatDate(date); 
      }

    const email = document.querySelector('.js-info').getAttribute('data-email')

    const requestData = {
      method: "get",
      endpoint: "/api/Patients/search",
      queryParameters: {
        query: `email:${email}`,
      },
    };
  
    fetch("https://api.happyaging.com/api/trudiagnostic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('data', data.data[0]);
    
      if (!data?.data?.[0]?.kits?.[0]) {
        return;
      }
    
      const kitStatus = data.data[0].kits[0].status;
    
      console.log(data.data[0].kits[0]);
      this.querySelector('.bio-age-test__status').textContent = kitStatus;
    
      let statusToPass = kitStatus;
    
      let dateStr = String(data.data[0].kits[0].dateRegistered);
    
      if (dateStr.includes('.') && dateStr.split('.')[1].length === 2) {
        dateStr += '0';
      }
    
      const datePlus1Week = getDateWithOffset(dateStr, 7);
      const datePlus2Weeks = getDateWithOffset(dateStr, 14);
    
      this.querySelector('.m-fr').textContent = datePlus1Week;
      this.querySelector('.m-sl').textContent = datePlus2Weeks;
    
      setItems(statusToPass);
    
      if (statusToPass === 'Result Ready') {
        // Commented out requestDataKit
        // const requestDataKit = {
        //   method: "get",
        //   endpoint: `/api/DiagnosticFiles/kits/${data.data[0].kits[0].id}/diagnosticFiles`,
        //   queryParameters: {
        //     query: `File:pdf`,
        //   }
        // };
    
        const requestDataReport = {
          method: "post",
          endpoint: `/api/Reports/`,
          data: {
            kitId: data.data[0].kits[0].kitIdentifier,
            reportType: "TruAge",
            renderStrategy: "Html",
            renderDetails: "PresignedUrl"
          }
        };
    
        fetch("https://api.happyaging.com/api/trudiagnostic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestDataReport),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('report final', data);
    
          const presignedUrl = data.presignedUrl;
    
          if (!presignedUrl) {
            console.error('No presigned URL provided in the report data.');
            return;
          }
    
          const resultsContainer = this.querySelector('.bio-age-test__step-results');
    
          resultsContainer.innerHTML = '';
    
          const resultHTML = `
            <div class="bio-age-test__step-result">
              <div class="bio-age-test__step-result-title">
                <span class="bio-age-test__step-result-name">${data.title || "Report"}</span>
                <span class="bio-age-test__step-result-format">HTML</span>
              </div>
              <a href="${presignedUrl}" target="_blank" class="bio-age-test__btn-download button button--black">View Report</a>
            </div>
          `;
    
          resultsContainer.insertAdjacentHTML('beforeend', resultHTML);
    
          document.querySelector('.m-results-status').style.display = 'none';
          document.querySelector('.m-results').style.display = 'block';
          document.querySelector('.bio-age-test__step-body--result').classList.remove("hidden");
        })
        .catch((error) => {
          console.error('Failed to fetch the report:', error);
        });
      }
    })
    .catch((error) => {
      console.error("Failed to fetch patient status:", error);
    });    

    const request = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          status: {
            expected: "Sep 18th",
            code: "3",
          },
          results: [
            {
              name: "HABioResults",
              format: "PDF",
              size: "2.3Mb",
              date: "10/2024",
              url: "https://morth.nic.in/sites/default/files/dd12-13_0.pdf",
            },
          ],
        });
      }, 1500);
    });

    request.then((response) => {
      this.data = response;

      this.initStatusBar();
      this.initResults();
    });

  }

  initStatusBar() {

    console.log('inited')

    this.statusBar = this.querySelector(".bio-age-test__status-bar");
    this.statusExpectedEls = this.querySelectorAll(
      ".bio-age-test__step-status-expected"
    );

    this.statusBarBody = this.querySelector(
      ".bio-age-test__step-body--status.bio-age-test__step-body--status"
    );

    this.statusBarItems = this.querySelectorAll(
      ".bio-age-test__status-bar-item"
    );

    for (const [index, item] of this.statusBarItems.entries()) {
      if (!this.data.status.code || index > parseInt(this.data.status.code))
        break;

      // item.classList.add("bio-age-test__status-bar-item--active");
    }

    this.statusExpectedEls.forEach((el) => {
      // el.innerText = this.data.status.expected;
    });

    this.statusBarBody.classList.remove("hidden");
  }

  initResults() {
    this.noResultsEl = this.querySelector(
      ".bio-age-test__step-body.bio-age-test__step-body--no-result"
    );
    this.resultsEl = this.querySelector(
      ".bio-age-test__step-body.bio-age-test__step-body--result"
    );
    return;
    if (!this.data.results.length) {
      this.noResultsEl.classList.remove("hidden");
      return;
    }

    const name = this.resultsEl.querySelector(
      ".bio-age-test__step-result-name"
    );
    const format = this.resultsEl.querySelector(
      ".bio-age-test__step-result-format"
    );
    const size = this.resultsEl.querySelector(
      ".bio-age-test__step-result-size"
    );
    const date = this.resultsEl.querySelector(
      ".bio-age-test__step-result-date"
    );
    const btnDownload = this.resultsEl.querySelector(
      ".bio-age-test__btn-download"
    );

    name.innerText = this.data.results[0]?.name;
    format.innerText = this.data.results[0]?.format;
    size.innerText = this.data.results[0]?.size;
    date.innerText = this.data.results[0]?.date;

    btnDownload.setAttribute("href", this.data.results[0].url);
    btnDownload.setAttribute(
      "download",
      `${this.data.results[0].name}.${this.data.results[0].format}`
    );

    this.resultsEl.classList.remove("hidden");
  }
}

customElements.define("bio-age-test", BioAgeTest);
