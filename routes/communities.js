const express = require("express");
const db = require("../db");
const router = express.Router();

// GET - Show Communities Page
router.get("/communities", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;

    db.all("SELECT * FROM communities", [], (err, allCommunities) => {
        if (err) {
            console.error("Error fetching communities:", err);
            return res.send("Error loading communities.");
        }

        db.all(`
            SELECT c.id, c.name, c.description, c.event_date, c.event_time, c.max_pax
            FROM communities c
            JOIN user_communities uc ON c.id = uc.community_id
            WHERE uc.user_id = ?
        `, [userId], (err, joinedCommunities) => {
            if (err) {
                console.error("Error fetching joined communities:", err);
                return res.send("Error loading joined communities.");
            }

            const joinedCommunityIds = new Set(joinedCommunities.map(c => c.id));

            res.render("communities", { allCommunities, joinedCommunities, joinedCommunityIds });
        });
    });
});

// ✅ FIX: Handle POST Request to Join a Community
router.post("/join-community", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { communityId } = req.body;

    // Check if user is already in the community
    db.get("SELECT * FROM user_communities WHERE user_id = ? AND community_id = ?", 
    [userId, communityId], (err, row) => {
        if (row) {
            return res.redirect("/communities"); // ✅ Stay on Communities page
        }

        // Insert user into community
        db.run("INSERT INTO user_communities (user_id, community_id) VALUES (?, ?)", 
        [userId, communityId], (err) => {
            if (err) {
                console.error("Error joining community:", err);
                return res.send("Error joining community.");
            }
            res.redirect("/communities"); // ✅ Redirect to Communities page, NOT Dashboard
        });
    });
});


// ✅ FIX: Handle POST Request to Leave a Community
router.post("/leave-community", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { communityId } = req.body;

    // Remove the user from the community
    db.run("DELETE FROM user_communities WHERE user_id = ? AND community_id = ?", 
    [userId, communityId], (err) => {
        if (err) {
            console.error("Error leaving community:", err);
            return res.send("Error leaving community.");
        }
        res.redirect("/communities"); // Redirect to update the dashboard dynamically
    });
});

// GET - Community Forum Page
router.get("/community/:id", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const communityId = req.params.id;

    // Check if the user has joined this community
    db.get("SELECT * FROM user_communities WHERE user_id = ? AND community_id = ?", 
    [userId, communityId], (err, joinedCommunity) => {
        if (err) {
            console.error("Error checking community membership:", err);
            return res.send("Error loading community.");
        }

        if (!joinedCommunity) {
            return res.send("You must join this community to view discussions.");
        }

        // Fetch community details
        db.get("SELECT * FROM communities WHERE id = ?", [communityId], (err, community) => {
            if (err || !community) {
                console.error("Error fetching community details:", err);
                return res.send("Community not found.");
            }

            // Fetch posts in the community
            db.all(`
                SELECT community_posts.*, users.username 
                FROM community_posts
                JOIN users ON community_posts.user_id = users.user_id
                WHERE community_id = ?
                ORDER BY created_at DESC
            `, [communityId], (err, posts) => {
                if (err) {
                    console.error("Error fetching community posts:", err);
                    return res.send("Error loading posts.");
                }

                res.render("community_forum", { community, posts, userId });
            });
        });
    });
});

// POST - Add a Post to Community
router.post("/community/:id/post", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const communityId = req.params.id;
    const { content } = req.body;

    if (!content.trim()) {
        return res.send("Post content cannot be empty.");
    }

    db.run(`
        INSERT INTO community_posts (user_id, community_id, content)
        VALUES (?, ?, ?)
    `, [userId, communityId, content], (err) => {
        if (err) {
            console.error("Error posting message:", err);
            return res.send("Error posting message.");
        }
        res.redirect(`/community/${communityId}`);
    });
});

// GET - Fetch Comments for a Post
router.get("/community/:id/post/:post_id/comments", (req, res) => {
    const { id, post_id } = req.params;

    db.all(`
        SELECT community_comments.*, users.username
        FROM community_comments
        JOIN users ON community_comments.user_id = users.user_id
        WHERE post_id = ?
        ORDER BY created_at ASC
    `, [post_id], (err, comments) => {
        if (err) {
            console.error("Error fetching comments:", err);
            return res.json({ success: false, message: "Error loading comments." });
        }
        res.json({ success: true, comments });
    });
});

// POST - Add a Comment to a Post
router.post("/community/:id/post/:post_id/comment", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { id, post_id } = req.params;
    const { content } = req.body;

    if (!content.trim()) {
        return res.send("Comment cannot be empty.");
    }

    db.run(`
        INSERT INTO community_comments (user_id, post_id, content)
        VALUES (?, ?, ?)
    `, [userId, post_id, content], (err) => {
        if (err) {
            console.error("Error adding comment:", err);
            return res.send("Error posting comment.");
        }
        res.redirect(`/community/${id}`);
    });
});

// GET - Fetch Polls for a Community
router.get("/community/:id/polls", (req, res) => {
    const communityId = req.params.id;

    db.all(`
        SELECT community_polls.*, users.username
        FROM community_polls
        JOIN users ON community_polls.user_id = users.user_id
        WHERE community_id = ?
        ORDER BY created_at DESC
    `, [communityId], (err, polls) => {
        if (err) {
            console.error("Error fetching polls:", err);
            return res.send("Error loading polls.");
        }

        res.json({ success: true, polls });
    });
});

// POST - Create a Poll
router.post("/community/:id/polls/create", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const communityId = req.params.id;
    const { question, option_1, option_2, option_3, option_4 } = req.body;

    db.run(`
        INSERT INTO community_polls (community_id, user_id, question, option_1, option_2, option_3, option_4)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [communityId, userId, question, option_1, option_2, option_3, option_4], (err) => {
        if (err) {
            console.error("Error creating poll:", err);
            return res.send("Error creating poll.");
        }
        res.redirect(`/community/${communityId}`);
    });
});

// POST - Vote in a Poll
router.post("/community/:id/poll/:poll_id/vote", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const userId = req.session.userId;
    const { id, poll_id } = req.params;
    const { choice } = req.body;

    // Check if user already voted
    db.get("SELECT * FROM poll_votes WHERE user_id = ? AND poll_id = ?", 
    [userId, poll_id], (err, row) => {
        if (row) {
            return res.send("You have already voted in this poll.");
        }

        // Insert vote
        db.run("INSERT INTO poll_votes (user_id, poll_id, choice) VALUES (?, ?, ?)", 
        [userId, poll_id, choice], (err) => {
            if (err) {
                console.error("Error voting:", err);
                return res.send("Error submitting vote.");
            }
            res.redirect(`/community/${id}`);
        });
    });
});


module.exports = router;
