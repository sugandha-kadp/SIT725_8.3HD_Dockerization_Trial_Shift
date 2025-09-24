const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'Piyum Sugandha Kapurubandara Arachchige Don',
    studentId: '225279848'
  });
});

module.exports = router;