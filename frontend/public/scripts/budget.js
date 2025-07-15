let transactionCount = 1;

document.getElementById('addTransaction').addEventListener('click', () => {
    transactionCount++;
    const transactionInputs = document.getElementById('transactionInputs');
    
    const transactionEntry = document.createElement('div');
    transactionEntry.classList.add('transaction-entry');
    transactionEntry.innerHTML = `
        <label for="amount-${transactionCount}">Amount:</label>
        <input type="number" id="amount-${transactionCount}" class="amount" placeholder="Enter amount" required>

        <label for="category-${transactionCount}">Category:</label>
        <select id="category-${transactionCount}" class="category" required>
            <option value="Essentials">Essentials</option>
            <option value="Wants">Wants</option>
            <option value="Savings">Savings</option>
        </select>

        <label for="description-${transactionCount}">Description:</label>
        <input type="text" id="description-${transactionCount}" class="description" placeholder="Description" required>
    `;
    transactionInputs.appendChild(transactionEntry);
});

document.getElementById('budgetForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const income = parseFloat(document.getElementById('income').value);
    const transactionAmounts = document.querySelectorAll('.amount');
    const transactionCategories = document.querySelectorAll('.category');
    const transactionDescriptions = document.querySelectorAll('.description');

    const transactions = [];
    for (let i = 0; i < transactionAmounts.length; i++) {
        const amount = parseFloat(transactionAmounts[i].value);
        const category = transactionCategories[i].value;
        const description = transactionDescriptions[i].value;

        transactions.push({ amount, category, description });
    }

    const response = await fetch('/api/budget/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, transactions }),
    });

    const result = await response.json();
    document.getElementById('result').innerHTML = `
        <h3>Spending Summary</h3>
        <p>Essentials: ${result.spendingSummary.essentials}</p>
        <p>Wants: ${result.spendingSummary.wants}</p>
        <p>Savings: ${result.spendingSummary.savings}</p>
        <h3>Recurring Expenses</h3>
        <p>${result.recurringExpenses.join(', ')}</p>
        <h3>Recommendations</h3>
        <p>${result.recommendations.join('<br>')}</p>
    `;
});