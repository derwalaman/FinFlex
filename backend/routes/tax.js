const express = require('express');
const router = express.Router();

// Tax Slabs
const taxSlabs = [
    [10000, 0.1],
    [20000, 0.2],
    [50000, 0.3],
    [Infinity, 0.4]
];

function calculateTax(income, taxSlabs, deductions) {
    const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);
    const taxableIncome = Math.max(0, income - totalDeductions);
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const [limit, rate] of taxSlabs) {
        if (remainingIncome <= 0) break;
        const incomeInSlab = Math.min(remainingIncome, limit);
        tax += incomeInSlab * rate;
        remainingIncome -= incomeInSlab;
    }

    return { tax, totalDeductions, taxableIncome };
}

router.post('/calculate', (req, res) => {
    const { income, deductions } = req.body;

    if (typeof income !== 'number' || !Array.isArray(deductions) || deductions.some(isNaN)) {
        return res.status(400).json({ error: 'Invalid input!' });
    }

    const { tax, totalDeductions, taxableIncome } = calculateTax(income, taxSlabs, deductions);

    res.json({ 
        income, 
        totalDeductions, 
        taxableIncome, 
        tax 
    });
});

module.exports = router;
