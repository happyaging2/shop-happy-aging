class MainRegisterKit extends HTMLElement {
    constructor() {
        super();
        this.drawDATE();
        this.fetchFormData();
    }

    fetchFormData() {
        const form = this.querySelector('form');

        form.addEventListener('submit', function (event) {

            event.preventDefault();

            const formData = new FormData(form);

            const year = formData.get('year');
            const day = formData.get('day');
            const month = formData.get('month');

            let formattedDay = String(day).padStart(2, '0');
            let formattedMonth = String(month).padStart(2, '0');

            const birthOfDate = `${year}-${formattedMonth}-${formattedDay}`;

            const barcode = formData.get('barcode');
            const barcodeConfirm = formData.get('barcodeConfirm');

            const data = {
                "method": "post",
                "endpoint": "/api/Registrations",
                "data": {
                    "accountInformation": {
                        "firstName": formData.get('firstName'),
                        "lastName": formData.get('lastName'),
                        "dateOfBirth": birthOfDate,
                        "email": formData.get('email'),
                        "externalId": formData.get('externalId')
                    },
                    "personalInformation": {
                        "biologicalSex": formData.get('sex'),
                        "alcoholUse": formData.get('alcoholUse'),
                        "ancestryEthnicity": formData.get('ancestryEthnicity'),
                        "weight": formData.get('weight'),
                        "height": {
                            "feet": formData.get('feet'),
                            "inches": formData.get('inches')
                        },
                        "rejuvenationOlympicsConsent": formData.get('rejuvenationOlympicsConsent')
                    },
                    "barcode": formData.get('barcode')
                }
            }

            if (barcode.length > 16 || barcode.length !== barcodeConfirm.length) {

                // const borderStl = 'border-bottom:1px solid red';
                // const errorMessage = 'Barcodes are not Equal';
                //
                // this.querySelector('#barcodeConfirm').style = borderStl;
                // this.querySelector('#barcode').style = borderStl;

                this.querySelector('.error-message').innerHTML = 'Barcodes are not equal';
            }

            // if (isValid) {
            fetch('https://api.happyaging.com/api/trudiagnostic', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (!data.ok) {
                        const errorReq = data["truDiagnosticError"].message.split(' ');

                        const barcodeMessage = 'barcode already registered or not found in the system';
                        const feetMessage = 'Feet value must be between 4 and 9';
                        const inchMessage = 'Inch value must be between 0 and 11';
                        const weightMessage = 'weight value must be above 40 and below 500';

                        const barcode = errorReq.includes('barcode');
                        const feet = errorReq.includes('Feet');
                        const inch = errorReq.includes('Inch');
                        const weight = errorReq.includes('weight');

                        if (feet) {
                            document.querySelector('.error-message').innerHTML = feetMessage
                            throw new Error(`${feetMessage}`);
                        }
                        if (inch) {
                            document.querySelector('.error-message').innerHTML = inchMessage;
                            throw new Error(`${inchMessage}`);
                        }
                        if (weight) {
                            document.querySelector('.error-message').innerHTML = weightMessage;
                            throw new Error(`${weightMessage}`);
                        }

                        if (barcode) {
                            document.querySelector('.error-message').innerHTML = barcodeMessage;
                            throw new Error(`${barcodeMessage}`);
                        }

                        throw new Error(`${data["truDiagnosticError"].message}`);
                    }
                    return data;
                }).then(() => {
                window.location.href = '/pages/kit-thank-you';
            })
                .catch(error => {
                    console.log('error', error)
                });
            // }
        });
    }

    drawDATE() {
      console.log(111)
        const daySelect = document.getElementById('day');
        const monthSelect = document.getElementById('month');
        const yearSelect = document.getElementById('year');

        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.text = day;
            daySelect.appendChild(option);
        }

        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.text = month;
            monthSelect.appendChild(option);
        }

        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 100; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        }
    }
}

customElements.define('main-register-kit', MainRegisterKit)
