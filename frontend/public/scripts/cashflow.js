// Add transaction event listener
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    // Validate input
    if (!from || !to || isNaN(amount) || amount <= 0) {
        alert('Please fill out all fields correctly with a positive amount.');
        return;
    }

    try {
        // Send request to the server
        const response = await fetch('/api/cashflow/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, amount }),
        });

        const result = await response.json(); // Process the response
        console.log('Server response:', result); // Log the server response

        if (response.ok) {
            alert('Transaction added successfully!');
            document.getElementById('transactionForm').reset(); // Reset the form fields
            addTransactionToTable({ from, to, amount }); // Add the transaction to the table
            document.getElementById('output').textContent = 'Transaction successfully added.';
        } else {
            alert('Failed to add transaction: ' + (result.message || 'Unknown error.'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the transaction. Please try again later.');
    }
});

// Optimize cash flow event listener
document.getElementById('optimizeBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/cashflow/optimize');
        const result = await response.json();
        console.log('Optimization response:', result); // Log the optimization response

        if (result.optimizedTransactions && result.optimizedTransactions.length > 0) {
            let output = 'Optimized Cash Flow Suggestions:\n\n';
            result.optimizedTransactions.forEach(tx => {
                output += `${tx.from} should pay ${tx.to}: $${tx.amount.toFixed(2)}\n`;
            });
            document.getElementById('output').textContent = output;
        } else {
            document.getElementById('output').textContent = 'No optimization needed or no transactions to optimize.';
        }
    } catch (error) {
        console.error('Error optimizing cash flow:', error);
        document.getElementById('output').textContent = 'An error occurred while optimizing cash flow. Please try again.';
    }
});

// Reset transactions event listener
document.getElementById('resetBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/cashflow/reset', { method: 'POST' });
        if (response.ok) {
            alert('Transactions reset successfully!');
            document.querySelector('#transactionTable tbody').innerHTML = ''; // Clear the table
            document.getElementById('output').textContent = 'All transactions have been reset.';
        } else {
            alert('Failed to reset transactions. Please try again.');
        }
    } catch (error) {
        console.error('Error resetting transactions:', error);
        alert('An error occurred while resetting transactions. Please try again later.');
    }
});

// Utility function to add a transaction to the table
function addTransactionToTable(transaction) {
    const tableBody = document.querySelector('#transactionTable tbody');
    const row = document.createElement('tr');

    // Create table cells
    const fromCell = document.createElement('td');
    fromCell.textContent = transaction.from;
    const toCell = document.createElement('td');
    toCell.textContent = transaction.to;
    const amountCell = document.createElement('td');
    amountCell.textContent = `$${transaction.amount.toFixed(2)}`;

    // Append cells to the row
    row.appendChild(fromCell);
    row.appendChild(toCell);
    row.appendChild(amountCell);

    // Append the row to the table body
    tableBody.appendChild(row);
}