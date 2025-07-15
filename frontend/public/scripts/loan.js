        // scripts/loan.js

        let loanCount = 1;

        document.getElementById('addLoan').addEventListener('click', () => {
            loanCount++;
            const loanInputs = document.getElementById('loanInputs');
            
            const loanEntry = document.createElement('div');
            loanEntry.classList.add('loan-entry');
            loanEntry.innerHTML = `
                <label for="amount-${loanCount}">Loan Amount:</label>
                <input type="number" id="amount-${loanCount}" class="loan-amount" placeholder="e.g., 10000" required>
                
                <label for="interestRate-${loanCount}">Interest Rate (%):</label>
                <input type="number" id="interestRate-${loanCount}" class="loan-interest" placeholder="e.g., 12" required>
            `;
            loanInputs.appendChild(loanEntry);
        });

        document.getElementById('loanForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const loanAmounts = document.querySelectorAll('.loan-amount');
            const loanInterestRates = document.querySelectorAll('.loan-interest');
            const totalPaymentField = document.getElementById('totalPayment');
            const resultDiv = document.getElementById('result');

            try {
                // Collect loan inputs
                const loans = [];
                for (let i = 0; i < loanAmounts.length; i++) {
                    const amount = parseFloat(loanAmounts[i].value);
                    const interestRate = parseFloat(loanInterestRates[i].value) / 100;

                    if (isNaN(amount) || isNaN(interestRate) || amount <= 0 || interestRate <= 0) {
                        throw new Error('Each loan must have a positive amount and interest rate.');
                    }

                    loans.push({ amount, interestRate });
                }

                const totalPayment = parseFloat(totalPaymentField.value);

                if (isNaN(totalPayment) || totalPayment <= 0) {
                    throw new Error('Total Payment must be a positive number.');
                }

                // Make API request
                const response = await fetch('/api/loan/scheduler', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loans, totalPayment }),
                });

                if (!response.ok) {
                    throw new Error('Failed to calculate repayment. Please try again.');
                }

                const result = await response.json();

                // Display result
                resultDiv.innerHTML = `
                    <p><strong>Total Repayment (Including Interest):</strong> $${result.totalRepayment.toFixed(2)}</p>
                `;

                if (result.isFullyPaid) {
                    resultDiv.innerHTML += `<p>All loans are paid off!</p>`;
                } else {
                    resultDiv.innerHTML += `<p><strong>Remaining Loans:</strong></p><ul>`;
                    result.remainingLoans.forEach((loan) => {
                        resultDiv.innerHTML += `<li>Loan Amount: $${loan.amount} - Interest Rate: ${loan.interestRate * 100}%</li>`;
                    });
                    resultDiv.innerHTML += `</ul>`;
                    resultDiv.innerHTML += `<p style="color: red;">There was not enough total payment to pay off all loans.</p>`;
                }

                if (result.paidLoans.length > 0) {
                    resultDiv.innerHTML += `<p><strong>Paid Loans:</strong></p><ul>`;
                    result.paidLoans.forEach((loan) => {
                        resultDiv.innerHTML += `<li>Loan Amount: $${loan.amount} - Interest Rate: ${loan.interestRate * 100}% - Paid Amount: $${loan.paidAmount.toFixed(2)}</li>`;
                    });
                    resultDiv.innerHTML += `</ul>`;
                }

            } catch (error) {
                resultDiv.innerHTML = `<p style="color: red;"><strong>Error:</strong> ${error.message}</p>`;
            }
        });