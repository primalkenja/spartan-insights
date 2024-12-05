const express = require('express');
const router = express.Router();
const Professor = require('../models/Professor');
const Course = require('../models/Course');

router.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        // Create a case-insensitive regex pattern that matches parts of words
        const searchPattern = new RegExp(query, 'i');

        // Search professors
        const professors = await Professor.find({
            $or: [
                { name: searchPattern },
                { department: searchPattern }
            ]
        });

        // Search courses
        const courses = await Course.find({
            $or: [
                { name: searchPattern },
                { description: searchPattern },
                // Handle course code searches (e.g., "CS 151" or "CS151")
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ['$prefix', ' ', { $toString: '$number' }] },
                            regex: searchPattern,
                            options: 'i'
                        }
                    }
                },
                // Search prefix alone
                { prefix: searchPattern },
                // Search number alone
                { number: parseInt(query) || -1 } // -1 ensures no match if query isn't a number
            ]
        });

        res.json({ professors, courses });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ message: 'Failed to perform search' });
    }
});

module.exports = router;