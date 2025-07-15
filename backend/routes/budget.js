const express = require('express');
const router = express.Router();

class Node {
    constructor(key) {
        this.key = key;
        this.left = null;
        this.right = null;
    }
}

class RedBlackTree {
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

function analyzeBudgetWithRBTree(income, transactions) {
    const budgetRule = {
        essentials: income * 0.5,
        wants: income * 0.3,
        savings: income * 0.2,
    };

    let totalEssentials = 0, totalWants = 0, totalSavings = 0;
    const rbTree = new RedBlackTree();
    const recurringExpenses = new Set();

    transactions.forEach(({ amount, category, description }) => {
        if (category === "Essentials") totalEssentials += amount;
        else if (category === "Wants") totalWants += amount;
        else if (category === "Savings") totalSavings += amount;

        if (rbTree.search(description)) {
            recurringExpenses.add(description);
        } else {
            rbTree.insert(description);
        }
    });

    const recommendations = [];
    if (totalEssentials > budgetRule.essentials) recommendations.push("Reduce spending on essentials.");
    if (totalWants > budgetRule.wants) recommendations.push("Cut down on discretionary spending.");
    if (totalSavings < budgetRule.savings) recommendations.push("Increase your savings contributions.");

    return {
        spendingSummary: { essentials: totalEssentials, wants: totalWants, savings: totalSavings },
        recurringExpenses: Array.from(recurringExpenses),
        recommendations,
    };
}

router.post('/analyze', (req, res) => {
    const { income, transactions } = req.body;
    if (!income || !Array.isArray(transactions)) {
        return res.status(400).json({ error: 'Invalid input!' });
    }

    const analysis = analyzeBudgetWithRBTree(income, transactions);
    res.json(analysis);
});

module.exports = router;
