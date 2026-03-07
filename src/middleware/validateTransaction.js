function validateTransaction(req, res, next) {
    const { type, category, amount, date } = req.body;
    const allowedTypes = ['income', 'expense'];
    const isPatch = req.method === 'PATCH';

    if(!req.headers['x-user-id']) {
        return res.status(400).json({ error: "Missing 'x-user-id' header." });
    } 

    // For PATCH, at least one field should be present
    if (isPatch && !type && !category && amount === undefined && date === undefined) {
        console.log('❌ Validation failed: No fields provided for PATCH');
        return res.status(400).json({ error: "At least one field must be provided for update." });
    }

    // Validate type (required for POST, optional for PATCH)
    if (type !== undefined) {
        if (!allowedTypes.includes(type)) {
            console.log('❌ Validation failed: Invalid type');
            return res.status(400).json({ error: "Invalid 'type'. Must be 'income' or 'expense'." });
        }
    } else if (!isPatch) {
        console.log('❌ Validation failed: Missing type');
        return res.status(400).json({ error: "Missing 'type'. Must be 'income' or 'expense'." });
    }

    // Validate category (required for POST, optional for PATCH)
    if (category !== undefined) {
        if (typeof category !== 'string' || category.trim() === '') {
            console.log('❌ Validation failed: Invalid category');
            return res.status(400).json({ error: "Invalid 'category'. Must be a non-empty string." });
        }
    } else if (!isPatch) {
        console.log('❌ Validation failed: Missing category');
        return res.status(400).json({ error: "Missing 'category'." });
    }

    // Validate amount (required for POST, optional for PATCH)
    if (amount !== undefined) {
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            console.log(`❌ Validation failed: Invalid amount (${amount})`);
            return res.status(400).json({ error: "Invalid 'amount'. Must be a positive number." });
        }
    } else if (!isPatch) {
        console.log('❌ Validation failed: Missing amount');
        return res.status(400).json({ error: "Missing 'amount'." });
    }

    // Validate date (optional for both POST and PATCH)
    if (date !== undefined && isNaN(Date.parse(date))) {
        console.log('❌ Validation failed: Invalid date');
        return res.status(400).json({ error: "Invalid 'date'." });
    }

    console.log('✅ Validation passed');
    next();
}

module.exports = { validateTransaction };