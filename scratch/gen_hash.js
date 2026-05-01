const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10, (err, hash) => {
    console.log(hash);
});
