
const categoryKeywords = {
    'Groceries': ['walmart', 'grocery', 'supermarket', 'food', 'market'],
    'Dining': ['restaurant', 'cafe', 'pizza', 'mcdonald', 'starbucks'],
    'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'spotify'],
    'Utilities': ['electric', 'water', 'internet', 'phone'],
    'Shopping': ['amazon', 'clothing', 'mall']
};

function suggestCategory(category) {
    if (!category) return 'Other';
    const lower = category.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return cat;
        }
    }
    return category; // return original if no match
}

module.exports = { suggestCategory };