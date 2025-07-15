const express = require('express');
const router = express.Router();

class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(loan) {
        this.heap.push(loan);
        this._heapifyUp();
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();

        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._heapifyDown();
        }

        return min;
    }

    _heapifyUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].interestRate >= this.heap[parentIndex].interestRate) break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    _heapifyDown() {
        let index = 0;
        const length = this.heap.length;
        while (index < length) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (
                leftChildIndex < length &&
                this.heap[leftChildIndex].interestRate < this.heap[smallest].interestRate
            ) {
                smallest = leftChildIndex;
            }
            if (
                rightChildIndex < length &&
                this.heap[rightChildIndex].interestRate < this.heap[smallest].interestRate
            ) {
                smallest = rightChildIndex;
            }

            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

// Function to calculate loan repayment
function calculateLoanRepayment(loans, totalPayment) {
    const minHeap = new MinHeap();
    const remainingLoans = [];
    const paidLoans = [];

    loans.forEach((loan) => {
        if (typeof loan.amount !== 'number' || typeof loan.interestRate !== 'number') {
            throw new Error('Invalid loan data: amount and interestRate must be numbers.');
        }
        if (loan.amount <= 0 || loan.interestRate < 0) {
            throw new Error('Invalid loan data: amount must be positive and interestRate non-negative.');
        }
        minHeap.insert({ ...loan }); // avoid mutating input
    });

    let totalRepayment = 0;
    let remainingPayment = totalPayment;

    while (remainingPayment > 0 && !minHeap.isEmpty()) {
        const loan = minHeap.extractMin();
        const interest = loan.amount * loan.interestRate;
        const fullPayment = loan.amount + interest;

        if (remainingPayment >= fullPayment) {
            // Fully repay loan with interest
            remainingPayment -= fullPayment;
            totalRepayment += fullPayment;
            paidLoans.push({ ...loan, paidAmount: fullPayment, fullyPaid: true });
        } else {
            // Can't pay full loan, pay as much as possible
            // Distribute remainingPayment into principal and interest proportionally

            const proportion = remainingPayment / fullPayment;
            const partialPrincipal = loan.amount * proportion;
            const partialInterest = interest * proportion;
            const paidAmount = partialPrincipal + partialInterest;

            totalRepayment += paidAmount;

            paidLoans.push({
                ...loan,
                paidAmount: paidAmount,
                fullyPaid: false,
            });

            loan.amount -= partialPrincipal;
            remainingLoans.push(loan);

            remainingPayment = 0; // All used
        }
    }

    const isFullyPaid = minHeap.isEmpty() && remainingLoans.length === 0;

    return {
        totalRepayment,
        remainingLoans,
        paidLoans,
        isFullyPaid
    };
}

// Route to handle the loan scheduler API
router.post('/scheduler', (req, res) => {
    try {
        const { loans, totalPayment } = req.body;

        if (!Array.isArray(loans) || typeof totalPayment !== 'number' || totalPayment <= 0) {
            return res.status(400).json({ error: 'Invalid input! Ensure loans is an array and totalPayment is a positive number.' });
        }

        const repaymentResult = calculateLoanRepayment(loans, totalPayment);

        res.json(repaymentResult);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
