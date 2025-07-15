const express = require('express');
const router = express.Router();

let transactions = [];

// Add transaction
router.post('/add', (req, res) => {
    const { from, to, amount } = req.body;
    if (!from || !to || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transaction details.' });
    }
    if (from === to) {
        return res.status(400).json({ message: 'Sender and receiver cannot be the same.' });
    }
    transactions.push({ from, to, amount });
    res.json({ message: 'Transaction added successfully.', transactions });
});

// Reset transactions
router.post('/reset', (req, res) => {
    transactions = [];
    res.json({ message: 'All transactions have been reset!' });
});

// Optimize transactions
router.get('/optimize', (req, res) => {
    function minimizeTransactions(transactions) {
        const balances = {};

        // Calculate balances
        transactions.forEach(({ from, to, amount }) => {
            balances[from] = (balances[from] || 0) - amount;
            balances[to] = (balances[to] || 0) + amount;
        });

        const balanceArray = Object.entries(balances)
            .filter(([_, balance]) => balance !== 0)
            .sort((a, b) => b[1] - a[1]);

        const result = [];

        while (balanceArray.length > 1) {
            const maxCredit = balanceArray[0];
            const maxDebt = balanceArray[balanceArray.length - 1];

            const amount = Math.min(maxCredit[1], -maxDebt[1]);

            result.push({
                from: maxDebt[0],
                to: maxCredit[0],
                amount,
            });

            maxCredit[1] -= amount;
            maxDebt[1] += amount;

            if (maxCredit[1] === 0) balanceArray.shift();
            if (maxDebt[1] === 0) balanceArray.pop();

            balanceArray.sort((a, b) => b[1] - a[1]);
        }

        return result;
    }

    const optimizedTransactions = minimizeTransactions(transactions);
    res.json({
        message: 'Cash flow optimization completed!',
        optimizedTransactions,
    });
});

module.exports = router;
