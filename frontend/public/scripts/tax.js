let deductionCount = 1;

document.getElementById('addDeduction').addEventListener('click', () => {
    deductionCount++;
    const deductionInputs = document.getElementById('deductionInputs');

    const deductionEntry = document.createElement('div');
    deductionEntry.classList.add('deduction-entry');
    deductionEntry.innerHTML = `
        <label for="deduction-${deductionCount}">Deduction:</label>
        <input type="number" id="deduction-${deductionCount}" class="deduction" placeholder="Enter deduction amount" required>
    `;
    deductionInputs.appendChild(deductionEntry);
});

document.getElementById('taxForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const income = parseFloat(document.getElementById('income').value);
    const deductionInputs = document.querySelectorAll('.deduction');
    const deductions = Array.from(deductionInputs).map(input => parseFloat(input.value));

    try {
        const response = await fetch('/api/tax/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ income, deductions })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('totalIncome').textContent = result.income.toFixed(2);
            document.getElementById('totalDeductions').textContent = result.totalDeductions.toFixed(2);
            document.getElementById('taxableIncome').textContent = result.taxableIncome.toFixed(2);
            document.getElementById('totalTax').textContent = result.tax.toFixed(2);
            document.getElementById('resultSection').style.display = 'block';
        } else {
            alert(result.error || 'An error occurred while calculating tax.');
        }
    } catch (error) {
        alert('Error fetching results. Please try again.');
    }
});