const express = require('express');
const router = express.Router();

class Node {
    constructor(key) {
        this.key = key;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(key) {
        this.root = this._insertRec(this.root, key);
    }

    _insertRec(node, key) {
        if (!node) return new Node(key);
        if (key < node.key) node.left = this._insertRec(node.left, key);
        else if (key > node.key) node.right = this._insertRec(node.right, key);
        return node;
    }

    search(key) {
        return this._searchRec(this.root, key);
    }

    _searchRec(node, key) {
        if (!node) return false;
        if (key === node.key) return true;
        return key < node.key ? this._searchRec(node.left, key) : this._searchRec(node.right, key);
    }
}

function analyzeBudgetWithTree(income, transactions) {
    const budgetRule = {
        essentials: income * 0.5,
        wants: income * 0.3,
        savings: income * 0.2,
    };

    let totalEssentials = 0;
    let totalWants = 0;
    let totalSavings = 0;

    const tree = new BinarySearchTree();
    const recurringExpenses = new Set();

    transactions.forEach((transaction) => {
        const { amount, category, description } = transaction;

        if (typeof amount !== 'number' || typeof category !== 'string' || typeof description !== 'string') {
            throw new Error('Invalid transaction format. Each transaction must have amount (number), category (string), and description (string).');
        }

        if (category === "Essentials") totalEssentials += amount;
        else if (category === "Wants") totalWants += amount;
        else if (category === "Savings") totalSavings += amount;

        if (tree.search(description)) {
            recurringExpenses.add(description);
        } else {
            tree.insert(description);
        }
    });

    const recommendations = [];
    if (totalEssentials > budgetRule.essentials) recommendations.push("Reduce spending on essentials.");
    if (totalWants > budgetRule.wants) recommendations.push("Cut down on discretionary spending.");
    if (totalSavings < budgetRule.savings) recommendations.push("Increase your savings contributions.");

    return {
        spendingSummary: {
            essentials: totalEssentials,
            wants: totalWants,
            savings: totalSavings
        },
        recurringExpenses: Array.from(recurringExpenses),
        recommendations,
    };
}

router.post('/analyze', (req, res) => {
    try {
        const { income, transactions } = req.body;

        if (typeof income !== 'number' || income <= 0 || !Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Invalid input! Income must be a positive number and transactions must be an array.' });
        }

        const analysis = analyzeBudgetWithTree(income, transactions);
        res.json(analysis);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
